export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  duration: string;
  type: 'englishbay' | 'complementary';
  topic: string;
}

export interface Task {
  id: string;
  type: 'grammar' | 'listening' | 'speaking';
  difficulty: 'medium' | 'hard' | 'advanced';
  instruction: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  speakingPrompt?: string;
  audioText?: string;
  xp: number;
}

export interface DailyLesson {
  day: number;
  week: number;
  title: string;
  topic: string;
  videos: VideoItem[];
  tasks: Task[];
  vocabulary: VocabCard[];
}

export interface VocabCard {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
}

// EnglishBay playlist videos (from the playlist)
const ENGLISHBAY_PLAYLIST_ID = 'PLZ65xj2SRHQB0T2GGk-R7bYxorKUkcyoj';

const ENGLISHBAY_VIDEOS: VideoItem[] = [
  { id: 'eb1', title: 'Advanced English Conversation', youtubeId: 'SHFGlulSRso', duration: '45 min', type: 'englishbay', topic: 'Conversation' },
  { id: 'eb2', title: 'Complex Grammar Structures', youtubeId: 'CJEDBzOK0lA', duration: '40 min', type: 'englishbay', topic: 'Grammar' },
  { id: 'eb3', title: 'Listening Comprehension Advanced', youtubeId: 'B0K6J8gS9Ts', duration: '35 min', type: 'englishbay', topic: 'Listening' },
  { id: 'eb4', title: 'Business English Mastery', youtubeId: '4JDM5c_-RB8', duration: '42 min', type: 'englishbay', topic: 'Business' },
  { id: 'eb5', title: 'Idioms & Phrasal Verbs', youtubeId: 'nWK0-6JrBqk', duration: '38 min', type: 'englishbay', topic: 'Vocabulary' },
  { id: 'eb6', title: 'Academic Writing Skills', youtubeId: 'aFCNob5bFhA', duration: '44 min', type: 'englishbay', topic: 'Writing' },
  { id: 'eb7', title: 'Pronunciation & Intonation', youtubeId: 'Yb0bTVBLXeE', duration: '36 min', type: 'englishbay', topic: 'Pronunciation' },
  { id: 'eb8', title: 'Advanced Vocabulary in Context', youtubeId: 'l3MZljBhzT4', duration: '41 min', type: 'englishbay', topic: 'Vocabulary' },
  { id: 'eb9', title: 'English in Real Situations', youtubeId: 'GbSdQqkU8MU', duration: '39 min', type: 'englishbay', topic: 'Real Life' },
  { id: 'eb10', title: 'Debate & Discussion Skills', youtubeId: 'dFBBBmU5t1Q', duration: '46 min', type: 'englishbay', topic: 'Speaking' },
];

const COMPLEMENTARY_VIDEOS: VideoItem[] = [
  { id: 'c1', title: 'TED Talk: Power of Words', youtubeId: 'arj7oStGLkU', duration: '20 min', type: 'complementary', topic: 'Communication' },
  { id: 'c2', title: 'BBC English Masterclass', youtubeId: 'Ei_nTAzDDCM', duration: '22 min', type: 'complementary', topic: 'Grammar' },
  { id: 'c3', title: 'English Grammar in Use', youtubeId: 'n7gNQpq-LCw', duration: '18 min', type: 'complementary', topic: 'Grammar' },
  { id: 'c4', title: 'CNN Learning English', youtubeId: 'H2-5ecFc738', duration: '25 min', type: 'complementary', topic: 'News' },
  { id: 'c5', title: 'American Accent Training', youtubeId: 'KBxYJLBQPZg', duration: '20 min', type: 'complementary', topic: 'Pronunciation' },
  { id: 'c6', title: 'Phrasal Verbs in Use', youtubeId: 'gkIGPrQoXG4', duration: '19 min', type: 'complementary', topic: 'Vocabulary' },
  { id: 'c7', title: 'IELTS Speaking Practice', youtubeId: '3X3hNrJEbME', duration: '23 min', type: 'complementary', topic: 'Speaking' },
  { id: 'c8', title: 'Advanced Listening Skills', youtubeId: 'Bq_xGBBMBx4', duration: '21 min', type: 'complementary', topic: 'Listening' },
  { id: 'c9', title: 'Business Communication', youtubeId: 'HAnw168huqA', duration: '24 min', type: 'complementary', topic: 'Business' },
  { id: 'c10', title: 'Storytelling in English', youtubeId: 'KxDwieKpawg', duration: '22 min', type: 'complementary', topic: 'Speaking' },
];

const VOCAB_BANKS: VocabCard[][] = [
  [
    { id: 'v1', word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', example: 'She gave an eloquent speech that moved the audience.', pronunciation: 'EL-uh-kwent' },
    { id: 'v2', word: 'Meticulous', definition: 'Showing great attention to detail', example: 'He was meticulous in his research.', pronunciation: 'meh-TIK-yoo-lus' },
    { id: 'v3', word: 'Pragmatic', definition: 'Dealing with things practically and realistically', example: 'We need a pragmatic approach to solve this.', pronunciation: 'prag-MAT-ik' },
    { id: 'v4', word: 'Ambiguous', definition: 'Open to more than one interpretation', example: 'The instructions were ambiguous and confusing.', pronunciation: 'am-BIG-yoo-us' },
    { id: 'v5', word: 'Conscientious', definition: 'Wishing to do one\'s work or duty well', example: 'She is a conscientious worker.', pronunciation: 'kon-shee-EN-shus' },
  ],
  [
    { id: 'v6', word: 'Ephemeral', definition: 'Lasting for a very short time', example: 'Fame can be ephemeral in the digital age.', pronunciation: 'eh-FEM-er-ul' },
    { id: 'v7', word: 'Tenacious', definition: 'Holding firm to a goal despite difficulty', example: 'Her tenacious spirit helped her succeed.', pronunciation: 'teh-NAY-shus' },
    { id: 'v8', word: 'Discrepancy', definition: 'A difference between two things that should be the same', example: 'There is a discrepancy in the financial records.', pronunciation: 'dis-KREP-un-see' },
    { id: 'v9', word: 'Synthesis', definition: 'Combination of elements to form a connected whole', example: 'The paper was a synthesis of multiple theories.', pronunciation: 'SIN-thuh-sis' },
    { id: 'v10', word: 'Proliferate', definition: 'Increase rapidly in numbers', example: 'Mobile devices have proliferated worldwide.', pronunciation: 'pro-LIF-er-ate' },
  ],
  [
    { id: 'v11', word: 'Catalyst', definition: 'Something that causes change or action', example: 'The discovery acted as a catalyst for innovation.', pronunciation: 'KAT-uh-list' },
    { id: 'v12', word: 'Inherent', definition: 'Existing naturally in something', example: 'There are inherent risks in any business.', pronunciation: 'in-HEER-ent' },
    { id: 'v13', word: 'Mitigate', definition: 'Make less severe or painful', example: 'We can mitigate the risks with careful planning.', pronunciation: 'MIT-ih-gate' },
    { id: 'v14', word: 'Salient', definition: 'Most noticeable or important', example: 'The salient point is that we need more funding.', pronunciation: 'SAY-lee-ent' },
    { id: 'v15', word: 'Reciprocal', definition: 'Given or felt by both sides equally', example: 'They had a reciprocal agreement to help each other.', pronunciation: 'reh-SIP-roh-kul' },
  ],
];

function generateGrammarTasks(day: number): Task[] {
  const allTopics = [
    { topic: 'Subjunctive Mood', sentences: [
      'If I _____ (be) you, I would study harder.',
      'She suggested that he _____ (take) the exam.',
      'It is essential that the report _____ (be) submitted.',
      'The committee recommended that she _____ (resign) immediately.',
      'I wish I _____ (know) about this earlier.',
      'It is crucial that every student _____ (complete) the assignment.',
      'He demanded that we _____ (arrive) on time.',
      'The teacher insisted that each student _____ (present) their work.',
      'If only she _____ (study) harder last semester.',
      'It is imperative that all participants _____ (register) in advance.',
    ]},
    { topic: 'Passive Voice', sentences: [
      'The proposal _____ (review) by the committee.',
      'The experiment _____ (conduct) under controlled conditions.',
      'The new policy _____ (implement) next month.',
      'Three major breakthroughs _____ (discover) this year.',
      'The data _____ (analyze) by the research team.',
      'The ancient manuscript _____ (examine) by experts.',
      'The building _____ (renovate) over the past two years.',
      'All decisions _____ (make) after careful deliberation.',
      'The report _____ (submit) before the deadline.',
      'The results _____ (publish) in an academic journal.',
    ]},
    { topic: 'Conditional Sentences', sentences: [
      'Had I known earlier, I _____ (act) differently.',
      'Unless you practice daily, you _____ (not improve).',
      'Should the situation change, we _____ (reconsider).',
      'Were she to apply, she _____ (get) the position.',
      'Had they invested wisely, they _____ (not face) this crisis.',
      'Provided that you meet all requirements, you _____ (qualify).',
      'If it _____ (not rain), we would have gone hiking.',
      'But for your help, the project _____ (fail).',
      'Assuming all goes well, we _____ (launch) next quarter.',
      'In the event that you disagree, you _____ (submit) a formal objection.',
    ]},
    { topic: 'Modal Verbs', sentences: [
      'You _____ have submitted the report yesterday.',
      'The results _____ indicate a significant improvement.',
      'They _____ not have overlooked such an obvious error.',
      'We _____ consider all available options before deciding.',
      'She _____ have arrived by now; I\'m worried.',
      'The decision _____ not have been made lightly.',
      'You _____ have informed us earlier about the change.',
      'This problem _____ be solved with proper planning.',
      'He _____ speak four languages fluently by age 20.',
      'We _____ not ignore the warning signs any longer.',
    ]},
  ];

  const topicIdx = (day - 1) % allTopics.length;
  const t = allTopics[topicIdx];

  return t.sentences.map((sentence, i) => ({
    id: `grammar_${day}_${i}`,
    type: 'grammar' as const,
    difficulty: i < 3 ? 'medium' : i < 7 ? 'hard' : 'advanced',
    instruction: `Fill in the blank using the correct form. Topic: ${t.topic}`,
    content: sentence,
    options: generateOptions(sentence, i),
    correctAnswer: getCorrectAnswer(sentence, i),
    xp: i < 3 ? 10 : i < 7 ? 15 : 20,
  }));
}

function generateOptions(sentence: string, idx: number): string[] {
  const optionSets = [
    ['were', 'was', 'am', 'be'],
    ['take', 'takes', 'took', 'taken'],
    ['be', 'is', 'are', 'been'],
    ['is reviewed', 'was reviewed', 'has been reviewed', 'will be reviewed'],
    ['is conducted', 'was conducted', 'has been conducted', 'had been conducted'],
    ['will be implemented', 'has been implemented', 'was implemented', 'is implemented'],
    ['would have acted', 'will act', 'would act', 'had acted'],
    ['will not improve', 'would not improve', 'cannot improve', 'do not improve'],
    ['will reconsider', 'would reconsider', 'should reconsider', 'must reconsider'],
    ['should', 'could', 'would', 'must'],
    ['might', 'could', 'should', 'must'],
    ['could', 'should', 'would', 'might'],
  ];
  return optionSets[idx % optionSets.length];
}

function getCorrectAnswer(sentence: string, idx: number): string {
  const answers = ['were', 'take', 'be', 'was reviewed', 'was conducted', 'will be implemented', 'would have acted', 'will not improve', 'will reconsider', 'should', 'might', 'could'];
  return answers[idx % answers.length];
}

function generateListeningTasks(day: number): Task[] {
  const passages = [
    {
      text: 'The phenomenon of globalization has fundamentally transformed the way businesses operate across international boundaries. Companies must now navigate complex regulatory environments, diverse cultural expectations, and rapidly evolving market dynamics. Those that successfully adapt tend to develop robust cross-cultural communication strategies and employ professionals with strong multilingual abilities.',
      questions: [
        { q: 'What has globalization fundamentally transformed?', a: 'The way businesses operate internationally', opts: ['Local economies', 'The way businesses operate internationally', 'Government regulations', 'Cultural values'] },
        { q: 'What must companies navigate?', a: 'Complex regulatory environments', opts: ['Simple rules', 'Complex regulatory environments', 'Easy markets', 'Cultural uniformity'] },
        { q: 'What strategy do successful companies develop?', a: 'Cross-cultural communication strategies', opts: ['Aggressive marketing', 'Cross-cultural communication strategies', 'Cost-cutting measures', 'Digital advertising'] },
        { q: 'What type of professionals do adaptive companies employ?', a: 'Professionals with strong multilingual abilities', opts: ['Young graduates', 'Professionals with strong multilingual abilities', 'Remote workers only', 'Technical engineers'] },
        { q: 'What are companies navigating in terms of culture?', a: 'Diverse cultural expectations', opts: ['Similar cultural values', 'Diverse cultural expectations', 'National traditions', 'Religious beliefs'] },
        { q: 'How are the market dynamics described?', a: 'Rapidly evolving', opts: ['Stable and predictable', 'Slowly changing', 'Rapidly evolving', 'Completely static'] },
      ]
    },
    {
      text: 'Technological innovation in artificial intelligence is creating unprecedented opportunities and challenges simultaneously. While automation increases efficiency and reduces operational costs, it also requires workers to continuously adapt their skill sets. Educational institutions are responding by developing curricula that emphasize critical thinking, creativity, and digital literacy — skills that complement rather than compete with machine capabilities.',
      questions: [
        { q: 'What is AI innovation creating simultaneously?', a: 'Unprecedented opportunities and challenges', opts: ['Only opportunities', 'Only challenges', 'Unprecedented opportunities and challenges', 'Simple solutions'] },
        { q: 'What does automation increase?', a: 'Efficiency and reduces operational costs', opts: ['Complexity only', 'Efficiency and reduces operational costs', 'Employment levels', 'Manual tasks'] },
        { q: 'What do workers need to continuously do?', a: 'Adapt their skill sets', opts: ['Find new jobs', 'Resist automation', 'Adapt their skill sets', 'Work less'] },
        { q: 'How are educational institutions responding?', a: 'Developing curricula emphasizing critical thinking', opts: ['Closing down', 'Developing curricula emphasizing critical thinking', 'Teaching only coding', 'Reducing course offerings'] },
        { q: 'Which skill is mentioned alongside critical thinking?', a: 'Creativity', opts: ['Memorization', 'Creativity', 'Speed reading', 'Manual labor'] },
        { q: 'How are these human skills described in relation to machines?', a: 'They complement machine capabilities', opts: ['They replace machines', 'They compete with machines', 'They complement machine capabilities', 'They are inferior to machines'] },
      ]
    },
    {
      text: 'Environmental sustainability has become a critical priority for both governments and corporations worldwide. Research indicates that proactive climate policies can generate significant economic benefits while preserving natural resources for future generations. Businesses that integrate sustainability into their core strategies report improved brand reputation, increased investor confidence, and long-term operational resilience in the face of climate-related disruptions.',
      questions: [
        { q: 'What have climate policies been shown to generate?', a: 'Significant economic benefits', opts: ['Higher taxes', 'Significant economic benefits', 'More pollution', 'Job losses'] },
        { q: 'What do these policies preserve?', a: 'Natural resources for future generations', opts: ['Corporate profits', 'Natural resources for future generations', 'Current jobs', 'Government power'] },
        { q: 'What do businesses integrating sustainability report?', a: 'Improved brand reputation', opts: ['Lower profits', 'Improved brand reputation', 'Increased costs', 'Reduced output'] },
        { q: 'What else do sustainable businesses experience?', a: 'Increased investor confidence', opts: ['Shareholder conflicts', 'Increased investor confidence', 'Regulatory penalties', 'Market contraction'] },
        { q: 'What kind of resilience do sustainable businesses develop?', a: 'Operational resilience to climate disruptions', opts: ['Financial flexibility only', 'Operational resilience to climate disruptions', 'Technical redundancy', 'Legal immunity'] },
        { q: 'Who are the two key groups mentioned as prioritizing sustainability?', a: 'Governments and corporations', opts: ['Consumers and employees', 'Governments and corporations', 'Scientists and academics', 'Media and journalists'] },
      ]
    },
  ];

  const passage = passages[(day - 1) % passages.length];

  return passage.questions.map((q, i) => ({
    id: `listening_${day}_${i}`,
    type: 'listening' as const,
    difficulty: i < 2 ? 'medium' : i < 4 ? 'hard' : 'advanced',
    instruction: 'Listen to the passage, then answer the comprehension question.',
    content: q.q,
    audioText: passage.text,
    options: q.opts,
    correctAnswer: q.a,
    xp: 12 + Math.floor(i / 2) * 4,
  }));
}

function generateSpeakingTasks(day: number): Task[] {
  const prompts = [
    { prompt: 'Discuss the impact of social media on modern communication. Include both positive and negative aspects.', instruction: 'Speak for 60-90 seconds on the topic.' },
    { prompt: 'Describe a significant challenge you have overcome and explain what you learned from that experience.', instruction: 'Speak for 60-90 seconds on the topic.' },
    { prompt: 'Argue for or against the proposition: "Remote work is more productive than office work."', instruction: 'Present a clear argument with supporting points.' },
    { prompt: 'Explain how technology has changed education and predict future trends.', instruction: 'Speak for 60-90 seconds with specific examples.' },
    { prompt: 'Compare two different approaches to learning a new language and justify which is more effective.', instruction: 'Speak for 60-90 seconds with clear reasoning.' },
  ];
  
  const p = prompts[(day - 1) % prompts.length];
  
  return [
    {
      id: `speaking_${day}_0`,
      type: 'speaking' as const,
      difficulty: 'advanced',
      instruction: p.instruction,
      content: p.prompt,
      speakingPrompt: p.prompt,
      xp: 25,
    },
    {
      id: `speaking_${day}_1`,
      type: 'speaking' as const,
      difficulty: 'advanced',
      instruction: 'Read the following paragraph aloud with natural intonation and pacing.',
      content: 'The capacity for critical thinking is arguably the most valuable skill in the modern workplace. Professionals who can analyze complex information, identify patterns, and draw well-reasoned conclusions are consistently more successful in navigating ambiguous situations.',
      audioText: 'The capacity for critical thinking is arguably the most valuable skill in the modern workplace. Professionals who can analyze complex information, identify patterns, and draw well-reasoned conclusions are consistently more successful in navigating ambiguous situations.',
      xp: 20,
    },
  ];
}

export function getLesson(week: number, day: number): DailyLesson {
  const ebVideo = ENGLISHBAY_VIDEOS[(day - 1) % ENGLISHBAY_VIDEOS.length];
  const comp1 = COMPLEMENTARY_VIDEOS[((day - 1) * 2) % COMPLEMENTARY_VIDEOS.length];
  const comp2 = COMPLEMENTARY_VIDEOS[((day - 1) * 2 + 1) % COMPLEMENTARY_VIDEOS.length];

  const grammarTasks = generateGrammarTasks(day);
  const listeningTasks = generateListeningTasks(day);
  const speakingTasks = generateSpeakingTasks(day);

  const allTasks = [
    ...grammarTasks.slice(0, 10),
    ...listeningTasks.slice(0, 6),
    ...speakingTasks.slice(0, 2),
    ...listeningTasks.slice(0, 2).map(t => ({ ...t, id: `${t.id}_r` })),
  ].slice(0, 20);

  const vocabSet = VOCAB_BANKS[(day - 1) % VOCAB_BANKS.length];

  return {
    day,
    week,
    title: ebVideo.topic,
    topic: ebVideo.topic,
    videos: [ebVideo, comp1, comp2],
    tasks: allTasks,
    vocabulary: vocabSet,
  };
}

export function getTotalTaskXP(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + t.xp, 0);
}

export { ENGLISHBAY_PLAYLIST_ID };
