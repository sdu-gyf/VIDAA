ARTICLE = """
在美国，女性的平均寿命远超男性。根据最新数据，女性的预期寿命约为81岁，而男性仅为76岁。加州大学旧金山分校的神经病学教授丹娜·杜巴尔博士指出，这一现象在全球范围内都非常显著，无论是在饥荒、疫情还是食物匮乏时期，女性的生存能力都更强。

然而，女性寿命更长并不意味着她们的生活质量更高。南加州大学戴维斯老龄科学应用研究和管理学院的副教授贝伦斯·贝纳永表示，女性的健康寿命，即健康生活的年数，通常比男性短。特别是进入晚年，女性的身体状况往往不如男性，更容易患上心血管疾病和阿尔茨海默病。这主要是因为年龄本身是这些疾病的风险因素，而绝经后的生理变化进一步加剧了这种风险。

科学家们正努力揭示男女衰老方式不同的原因，希望找到延长两性寿命和健康寿命的方法。杜巴尔博士的实验室在一项研究中发现，拥有XX染色体和卵巢的小鼠寿命最长，其次是XY染色体和睾丸的小鼠，而只有X染色体的小鼠寿命最短。这表明第二个X染色体可能在延缓衰老方面起着关键作用。
"""

TITLE = "揭秘：女性为何比男性长寿？"

background_image_key_list = [
    "https://images.pexels.com/photos/29235309/pexels-photo-29235309.jpeg",
    "https://images.pexels.com/photos/29235322/pexels-photo-29235322.jpeg",
    "https://images.pexels.com/photos/29235339/pexels-photo-29235339.jpeg",
    "https://images.pexels.com/photos/18777024/pexels-photo-18777024.jpeg",
    "https://images.pexels.com/photos/20830465/pexels-photo-20830465.jpeg",
    "https://images.pexels.com/photos/19965729/pexels-photo-19965729.jpeg",
    "https://images.pexels.com/photos/27796658/pexels-photo-27796658.jpeg",
    "https://images.pexels.com/photos/19438267/pexels-photo-19438267.jpeg",
    "https://images.pexels.com/photos/16194816/pexels-photo-16194816.jpeg",
    "https://images.pexels.com/photos/28143386/pexels-photo-28143386.jpeg",
    "https://images.pexels.com/photos/28199933/pexels-photo-28199933.jpeg",
    "https://images.pexels.com/photos/29148855/pexels-photo-29148855.jpeg",
    "https://images.pexels.com/photos/28192753/pexels-photo-28192753.jpeg",
    "https://images.pexels.com/photos/5254256/pexels-photo-5254256.jpeg",
    "https://images.pexels.com/photos/4053516/pexels-photo-4053516.jpeg",
    "https://images.pexels.com/photos/4714777/pexels-photo-4714777.jpeg",
    "https://images.pexels.com/photos/7211201/pexels-photo-7211201.jpeg",
    "https://images.pexels.com/photos/9371980/pexels-photo-9371980.jpeg",
    "https://images.pexels.com/photos/10863556/pexels-photo-10863556.jpeg",
    "https://images.pexels.com/photos/8935988/pexels-photo-8935988.jpeg",
    "https://images.pexels.com/photos/11718160/pexels-photo-11718160.jpeg",
    "https://images.pexels.com/photos/10205639/pexels-photo-10205639.jpeg",
    "https://images.pexels.com/photos/6441460/pexels-photo-6441460.jpeg",
    "https://images.pexels.com/photos/14603745/pexels-photo-14603745.jpeg",
    "https://images.pexels.com/photos/14820983/pexels-photo-14820983.jpeg",
    "https://images.pexels.com/photos/15523850/pexels-photo-15523850.jpeg",
    "https://images.pexels.com/photos/20079653/pexels-photo-20079653.jpeg",
    "https://images.pexels.com/photos/13788415/pexels-photo-13788415.jpeg",
    "https://images.pexels.com/photos/19834943/pexels-photo-19834943.jpeg",
    "https://images.pexels.com/photos/20810654/pexels-photo-20810654.jpeg",
    "https://images.pexels.com/photos/20847591/pexels-photo-20847591.jpeg",
    "https://images.pexels.com/photos/19902540/pexels-photo-19902540.jpeg",
    "https://images.pexels.com/photos/16804467/pexels-photo-16804467.jpeg",
    "https://images.pexels.com/photos/19500831/pexels-photo-19500831.jpeg",
    "https://images.pexels.com/photos/14852082/pexels-photo-14852082.jpeg",
    "https://images.pexels.com/photos/11779513/pexels-photo-11779513.jpeg",
    "https://images.pexels.com/photos/18002652/pexels-photo-18002652.jpeg",
    "https://images.pexels.com/photos/20548749/pexels-photo-20548749.png",
    "https://images.pexels.com/photos/28343900/pexels-photo-28343900.jpeg",
    "https://images.pexels.com/photos/25047770/pexels-photo-25047770.jpeg",
    "https://images.pexels.com/photos/29235333/pexels-photo-29235333.jpeg",
    "https://images.pexels.com/photos/29235337/pexels-photo-29235337.jpeg",
    "https://images.pexels.com/photos/27278694/pexels-photo-27278694.jpeg",
    "https://images.pexels.com/photos/27796657/pexels-photo-27796657.jpeg",
    "https://images.pexels.com/photos/26593803/pexels-photo-26593803.jpeg",
    "https://images.pexels.com/photos/18414753/pexels-photo-18414753.jpeg",
    "https://images.pexels.com/photos/18961859/pexels-photo-18961859.jpeg",
    "https://images.pexels.com/photos/28998600/pexels-photo-28998600.jpeg",
    "https://images.pexels.com/photos/30368564/pexels-photo-30368564.jpeg",
    "https://images.pexels.com/photos/4612722/pexels-photo-4612722.jpeg",
]
