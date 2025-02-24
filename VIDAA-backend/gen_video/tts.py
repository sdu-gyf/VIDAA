import asyncio
from typing import AsyncGenerator
import edge_tts
import pysrt


def merge_subtitles(
    subs: list[pysrt.SubRipItem], full_text_with_punctuation: str
) -> str:

    # Get original text from srt (without punctuation)
    original_text = "".join(sub.text for sub in subs)

    # Create a mapping of positions where punctuation should be
    punctuation_positions = {}
    cleaned_text = ""

    # Find all punctuation positions by comparing with original text
    for char in full_text_with_punctuation:
        if char in original_text:
            cleaned_text += char
        else:
            # If character is not in original text, it's likely punctuation
            punctuation_positions[len(cleaned_text) - 1] = char

    # Process subtitles
    merged_subs = []
    current_start = None
    current_text = ""
    char_count = 0

    for sub in subs:
        if current_start is None:
            current_start = sub.start

        current_text += sub.text
        char_count += len(sub.text)

        # Check if we should split here
        if char_count - 1 in punctuation_positions:
            new_sub = pysrt.SubRipItem(
                index=len(merged_subs) + 1,
                start=current_start,
                end=sub.end,
                text=current_text,  # Remove the punctuation here
            )
            merged_subs.append(new_sub)
            current_text = ""
            current_start = None

    # Handle any remaining text
    if current_text:
        new_sub = pysrt.SubRipItem(
            index=len(merged_subs) + 1,
            start=current_start,
            end=subs[-1].end,
            text=current_text,
        )
        merged_subs.append(new_sub)

    # Create new subtitle file
    new_subs = pysrt.SubRipFile()
    new_subs.extend(merged_subs)

    str_subs = "\n".join([str(sub) for sub in new_subs])
    return str_subs


async def tts_and_get_srt(text: str, voice: str) -> AsyncGenerator[dict, None]:
    communicate = edge_tts.Communicate(text, voice)
    submaker = edge_tts.SubMaker()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield {"type": "audio", "data": chunk["data"]}
        elif chunk["type"] == "WordBoundary":
            submaker.feed(chunk)

    str_content = submaker.get_srt()
    subs = pysrt.from_string(str_content)

    yield {"type": "srt", "data": merge_subtitles(subs, text)}


if __name__ == "__main__":
    TEXT = """
新华社柏林2月13日电（记者褚怡）第75届柏林电影节13日开幕。今年共有19部电影入围主竞赛单元，将围绕金熊奖和银熊奖等主要奖项展开角逐。
剧情片《光》为本届电影节揭幕。该影片由德国导演汤姆·提克威执导，围绕柏林现代家庭恩格斯一家五口展开，讲述在叙利亚女管家法拉赫的介入下，这个曾支离破碎的家庭重新凝聚在一起的故事。
美国独立导演托德·海因斯出任本届电影节主竞赛单元评委会主席，他曾凭借《远离天堂》《天鹅绒金矿》等作品获多项奥斯卡提名。评委会成员包括法国摩洛哥裔导演纳比勒·阿尤什、德国导演玛丽亚·施拉德尔等。
柏林电影节主办方此前宣布，将本届电影节终身成就荣誉金熊奖授予英国女演员蒂尔达·斯温顿，颁奖典礼在13日的开幕式上举行。
柏林电影节始创于1951年，与法国戛纳电影节、意大利威尼斯电影节并称欧洲三大电影节。本届电影节将持续至2月23日。
    """
    VOICE = "zh-CN-XiaoxiaoNeural"
    OUTPUT_FILE = "test.mp3"
    SRT_FILE = "test.srt"

    async def main():
        with open(OUTPUT_FILE, "wb") as file:
            async for chunk in tts_and_get_srt(TEXT, VOICE):
                if chunk["type"] == "audio":
                    file.write(chunk["data"])
                elif chunk["type"] == "srt":
                    print(chunk["data"])

    asyncio.run(main())
