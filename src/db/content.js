// Book content store — bundled as JS (gzip-compressed in the build, ~1KB per book).
// Content is structured as chapters with title + body paragraphs.

const CONTENT = {

  // ─── 人工智能之不能 ─────────────────────────────────────────────────────────
  'ai-neng': {
    chapters: [
      {
        number: 1,
        title: '人工智能的边界',
        subtitle: '我们究竟在讨论什么？',
        paragraphs: [
          '人工智能，这个词在过去十年间几乎无处不在。它出现在政府报告里，出现在科技公司的宣传手册里，也出现在父母对孩子的叮嘱之中——"你要学AI，否则将来会被淘汰。"但奇怪的是，我们很少停下来认真问一个问题：人工智能究竟是什么？它真的能做到人们说的那些事情吗？',
          '本书并不打算告诉你人工智能有多厉害。恰恰相反，我们想从科学的角度，讨论它真正做不到的事情——那些被过度渲染、被误解，甚至被刻意夸大的"能力"。',
          '马兆远在量子计算与人工智能领域深耕多年。他观察到一个现象：公众对AI的期待往往超越了技术的实际边界。这种落差不仅产生于科幻小说，也产生于那些为了融资而夸大技术能力的创业者，以及那些追求点击率而不求准确的媒体报道。',
          '什么叫"智能"？这是理解AI局限的第一步。人类的智能包含感知、推理、情感、语言、创造力和自我意识。现阶段的人工智能，本质上是一种统计学工具——它在海量数据中寻找模式，然后用这些模式对新数据做出预测。它不"理解"语言，它只是学会了语言的统计规律。它不"看懂"图片，它只是学会了像素值之间的相关性。',
          '这并不是说AI没有价值。恰恰相反，在特定的、边界清晰的任务上，AI表现出的能力令人叹为观止：下围棋、识别癌症影像、预测蛋白质折叠。但这些成就的背后，是大量数据、算力和精心设计的目标函数——而不是通用的"智慧"。',
          '本书将带你走进AI真正的工作原理，探讨它在创造力、情感、道德判断、因果推理等领域的根本局限。我们的目的不是泼冷水，而是帮你建立一个清醒的认知框架——在这个框架里，AI是一个强大的工具，而不是全知全能的神明。',
        ],
      },
      {
        number: 2,
        title: '模式识别的天花板',
        subtitle: '当机器"看见"，却不"理解"',
        paragraphs: [
          '2012年，深度学习在ImageNet图像识别大赛上取得了突破性成绩，错误率从26%骤降至16%。此后数年，AI识别图像的准确率不断攀升，甚至在某些标准测试集上超过了人类。媒体纷纷宣称：机器已经学会了"看"。',
          '但"看"和"理解"之间，隔着一道人工智能至今无法逾越的鸿沟。',
          '研究人员做过一个经典实验：在一张被正确识别为"学校巴士"的图片上，叠加一层人眼几乎察觉不到的噪点，结果AI以99.7%的置信度将其判断为"鸵鸟"。这种被称为"对抗样本"的现象揭示了一个深刻的问题：AI学到的，是数据集中的统计规律，而不是真实世界的因果结构。',
          '人类看到学校巴士，会联想到学生、放学、安全、道路。我们的理解是网状的、有语境的、有因果的。AI的识别是点状的——它匹配的是特征向量，而不是概念。一旦输入略微偏离训练分布，它的判断就可能崩溃。',
          '这就是模式识别的天花板：它在已知的数据分布内表现优秀，但面对真实世界的复杂性和多变性，它的脆弱性令人担忧。这不是算法的问题，而是这种学习范式的根本局限。',
        ],
      },
    ],
  },

  // ─── Here I Am! ────────────────────────────────────────────────────────────
  'here-i-am': {
    chapters: [
      {
        number: 1,
        title: 'In the Beginning',
        subtitle: 'Questions worth asking',
        paragraphs: [
          'Have you ever lain awake at night and wondered: Why am I here? Not "here" as in this bedroom, in this house, in this town — but here at all. Why does anything exist rather than nothing?',
          'These are not easy questions. In fact, some of them are so hard that scientists, philosophers, and theologians have been wrestling with them for thousands of years without reaching agreement. But that is not a reason to stop asking. The asking is itself a deeply human thing.',
          'Russell Stannard has spent a lifetime at the boundary between physics and the big questions. As a nuclear physicist who has also written extensively about science and religion, he is comfortable sitting in the space between what we can measure and what we can only wonder about.',
          'This book is an exploration of what science — and especially modern physics — has to say about the deepest questions of existence. It is not a book that will tell you what to believe. It is a book that will show you what we know, what we do not know, and how to think carefully about the difference.',
          'We will travel from the very beginning — the Big Bang, when our universe was smaller than a full stop on this page — all the way to the present, a cosmos of hundreds of billions of galaxies, each containing hundreds of billions of stars. We will look at time itself, and ask whether it had a beginning. We will look at the laws of physics, and wonder why they are so precisely tuned to allow life to exist.',
          'And we will ask, with honesty and without pretension, the question that underlies all the others: Here I am — but why?',
        ],
      },
      {
        number: 2,
        title: 'The Fabric of Space and Time',
        subtitle: 'What Einstein changed forever',
        paragraphs: [
          'Before Einstein, most people thought of space as a kind of empty container — a vast, featureless void inside which things happened. Time was thought to flow at the same rate for everyone, like a river that carries all of us equally, from past to future.',
          'Einstein showed that both of these ideas are wrong.',
          'Space and time are not separate things. They are woven together into a single fabric called spacetime. And that fabric is not flat — it is curved by mass and energy. The Earth curves the spacetime around it, and that curvature is what we experience as gravity. You are not being pulled toward the ground by a mysterious force; you are following the natural curves of spacetime, which massive objects like the Earth have bent.',
          'This sounds abstract, but it has very practical consequences. GPS satellites have to correct for relativistic effects — without Einstein\'s equations, your phone\'s maps would drift by several kilometres each day.',
          'Even stranger: the faster you move through space, the slower you move through time. This is not a metaphor. Astronauts on the International Space Station age very slightly slower than people on the ground. Time is genuinely, measurably elastic.',
          'If space and time are elastic, then the question "what happened before the Big Bang?" may not even make sense — because time itself began at the Big Bang. There was no "before." This is not a failure of our imagination. It is a property of the universe we actually live in.',
        ],
      },
    ],
  },
}

export function getContent(bookId) {
  return CONTENT[bookId] ?? null
}

export function getChapter(bookId, chapterIndex = 0) {
  const book = CONTENT[bookId]
  if (!book) return null
  return book.chapters[chapterIndex] ?? book.chapters[0]
}
