import os
from pathlib import Path

from playwright.async_api import async_playwright

from .uploader_interface import UploaderInterface


class DouyinUploader(UploaderInterface):
    def __init__(self):
        pass


if __name__ == "__main__":
    import asyncio

    async def test_login():
        async with async_playwright() as p:
            options = {
                "headless": False,
            }
            if os.environ.get("VIDAA_ENABLE_PROXY") == "true":
                options["proxy"] = {
                    "server": os.environ.get("VIDAA_PROXY_SERVER"),
                }
            browser = await p.chromium.launch(**options)
            context = await browser.new_context(ignore_https_errors=True)
            path = Path(__file__).parent / "stealth.min.js"
            await context.add_init_script(path=path)
            page = await context.new_page()
            await page.goto(
                "https://creator.douyin.com/",
                timeout=60000 * 20 * 30,
                wait_until="commit",
            )
            # click agreement
            await page.locator(".agreement-FCwv7r > img:nth-child(1)").click()
            # fill phone number
            await page.locator("#number").fill(os.environ.get("DOUYIN_PHONE_NUMBER"))
            # click send code
            await page.locator(".douyin-creator-vmock-input-suffix").click()
            code = input("please input the code: ")
            # fill code
            await page.locator("#code").fill(code)
            # click login
            await page.locator(".douyin-creator-vmock-button-content").click()
            await page.pause()

            await context.storage_state(path="state.json")

    asyncio.run(test_login())
