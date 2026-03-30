export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  duration: string;
  type: 'englishbay' | 'complementary';
  topic: string;
  playlistId?: string;
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

export const ENGLISHBAY_PLAYLIST_ID = 'PLZ65xj2SRHQB0T2GGk-R7bYxorKUkcyoj';
export const ENGLISHBAY_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${ENGLISHBAY_PLAYLIST_ID}`;

// ── Real video IDs extracted directly from the EnglishBay playlist ──
// Playlist: https://www.youtube.com/playlist?list=PLZ65xj2SRHQB0T2GGk-R7bYxorKUkcyoj
// IDs confirmed by fetching the playlist page (not the playlist ID itself)
const ENGLISHBAY_VIDEOS: VideoItem[] = [
  { id: 'eb1',  title: 'EnglishBay – Passive Voice in English',           youtubeId: '5oiNmAkmkak', duration: '~30 min', type: 'englishbay', topic: 'Grammar – Passive Voice',    playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb2',  title: 'EnglishBay – Modal Verbs: Must & Have To',        youtubeId: '64cZmvI6Vgc', duration: '~28 min', type: 'englishbay', topic: 'Grammar – Modals',          playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb3',  title: 'EnglishBay – Modal Verbs: Should & Ought To',     youtubeId: 'A2ltxVTt848', duration: '~28 min', type: 'englishbay', topic: 'Grammar – Modals',          playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb4',  title: 'EnglishBay – Simple Past Tense',                  youtubeId: 'dw5bMTE8KLo', duration: '~32 min', type: 'englishbay', topic: 'Grammar – Past Tense',      playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb5',  title: 'EnglishBay – Comparatives & Superlatives',        youtubeId: 'emDuyhYqlXw', duration: '~26 min', type: 'englishbay', topic: 'Grammar – Comparatives',    playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb6',  title: 'EnglishBay – Modal Verbs: Can & Could',           youtubeId: 'FEKwE-Qv3vs', duration: '~30 min', type: 'englishbay', topic: 'Grammar – Modals',          playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb7',  title: 'EnglishBay – Past Continuous Tense',              youtubeId: 'DrYGemNVFE0', duration: '~29 min', type: 'englishbay', topic: 'Grammar – Past Continuous', playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb8',  title: 'EnglishBay – Could / Would in Context',           youtubeId: '_5GZqUvGT4g', duration: '~31 min', type: 'englishbay', topic: 'Grammar – Modals',          playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb9',  title: 'EnglishBay – Conditional Sentences',              youtubeId: '2dm7AWaqlv0', duration: '~33 min', type: 'englishbay', topic: 'Grammar – Conditionals',    playlistId: ENGLISHBAY_PLAYLIST_ID },
  { id: 'eb10', title: 'EnglishBay – Subjunctive & Expressing Wishes',    youtubeId: '4bL5nYlIWqc', duration: '~27 min', type: 'englishbay', topic: 'Grammar – Subjunctive',     playlistId: ENGLISHBAY_PLAYLIST_ID },
];

// ── Complementary videos — TED Talks & known-embeddable educational content ──
// TED content is reliably embeddable; IDs verified from TED.com
const COMPLEMENTARY_VIDEOS: VideoItem[] = [
  { id: 'c1',  title: 'How to Speak So People Want to Listen',         youtubeId: 'eIho2S0ZahI', duration: '11 min', type: 'complementary', topic: 'Communication' },
  { id: 'c2',  title: 'How Language Shapes the Way We Think',          youtubeId: 'RKK7wGAYP6k', duration: '14 min', type: 'complementary', topic: 'Linguistics' },
  { id: 'c3',  title: '10 Ways to Have a Better Conversation',         youtubeId: 'R1vskiVDwl4', duration: '12 min', type: 'complementary', topic: 'Speaking' },
  { id: 'c4',  title: 'The Linguistic Genius of Babies',               youtubeId: 'G2XBIkHW954', duration: '10 min', type: 'complementary', topic: 'Language Acquisition' },
  { id: 'c5',  title: 'Your Body Language May Shape Who You Are',      youtubeId: 'Ks-_Mh1QhMc', duration: '21 min', type: 'complementary', topic: 'Communication' },
  { id: 'c6',  title: 'The Power of Vulnerability',                    youtubeId: 'iCvmsMzlF7o', duration: '20 min', type: 'complementary', topic: 'Expression' },
  { id: 'c7',  title: 'Do Schools Kill Creativity?',                   youtubeId: 'iG9CE55wbtY', duration: '19 min', type: 'complementary', topic: 'Learning' },
  { id: 'c8',  title: 'The Danger of a Single Story',                  youtubeId: 'D9Ihs241zeg', duration: '19 min', type: 'complementary', topic: 'Storytelling' },
  { id: 'c9',  title: 'How Great Leaders Inspire Action',              youtubeId: 'qp0HIF3SfI4', duration: '18 min', type: 'complementary', topic: 'Leadership' },
  { id: 'c10', title: 'Inside the Mind of a Master Procrastinator',    youtubeId: 'arj7oStGLkU', duration: '14 min', type: 'complementary', topic: 'Fluency' },
];

const VOCAB_BANKS: VocabCard[][] = [
  [
    { id: 'v1', word: 'Eloquent', definition: 'Fluent or persuasive in speaking or writing', example: 'She gave an eloquent speech that moved the entire audience.', pronunciation: 'EL-uh-kwent' },
    { id: 'v2', word: 'Meticulous', definition: 'Showing great attention to detail; very careful and precise', example: 'He was meticulous in reviewing every clause of the contract.', pronunciation: 'meh-TIK-yoo-lus' },
    { id: 'v3', word: 'Pragmatic', definition: 'Dealing with things sensibly and realistically', example: 'A pragmatic approach to negotiations yielded the best results.', pronunciation: 'prag-MAT-ik' },
    { id: 'v4', word: 'Ambiguous', definition: 'Open to more than one interpretation; not clear', example: 'The ambiguous wording in the contract caused a dispute.', pronunciation: 'am-BIG-yoo-us' },
    { id: 'v5', word: 'Conscientious', definition: 'Wishing to do one\'s work thoroughly and correctly', example: 'Only the most conscientious students passed the advanced exam.', pronunciation: 'kon-shee-EN-shus' },
  ],
  [
    { id: 'v6', word: 'Ephemeral', definition: 'Lasting for a very short time; transitory', example: 'Social media fame is often ephemeral and fleeting.', pronunciation: 'eh-FEM-er-ul' },
    { id: 'v7', word: 'Tenacious', definition: 'Holding firmly to a purpose or belief; very determined', example: 'Her tenacious spirit drove her to finish despite every obstacle.', pronunciation: 'teh-NAY-shus' },
    { id: 'v8', word: 'Discrepancy', definition: 'A difference between two things that should be the same', example: 'The auditor found a discrepancy in the financial records.', pronunciation: 'dis-KREP-un-see' },
    { id: 'v9', word: 'Synthesis', definition: 'The combination of ideas into a new complex whole', example: 'The thesis was a synthesis of decades of linguistic research.', pronunciation: 'SIN-thuh-sis' },
    { id: 'v10', word: 'Proliferate', definition: 'Increase rapidly in number; multiply', example: 'Online courses have proliferated over the past decade.', pronunciation: 'pro-LIF-er-ate' },
  ],
  [
    { id: 'v11', word: 'Catalyst', definition: 'Something that causes or accelerates an important change', example: 'The discovery acted as a catalyst for innovation in medicine.', pronunciation: 'KAT-uh-list' },
    { id: 'v12', word: 'Inherent', definition: 'Existing as a permanent or essential attribute', example: 'There are inherent risks in every entrepreneurial venture.', pronunciation: 'in-HEER-ent' },
    { id: 'v13', word: 'Mitigate', definition: 'Make something less severe, serious, or painful', example: 'Careful planning can help mitigate most foreseeable risks.', pronunciation: 'MIT-ih-gate' },
    { id: 'v14', word: 'Salient', definition: 'Most noticeable or important; prominent', example: 'The most salient point is that funding must be secured first.', pronunciation: 'SAY-lee-ent' },
    { id: 'v15', word: 'Reciprocal', definition: 'Given, felt, or done by each toward the other; mutual', example: 'The two firms signed a reciprocal trade agreement.', pronunciation: 'reh-SIP-roh-kul' },
  ],
  [
    { id: 'v16', word: 'Nuanced', definition: 'Characterized by subtle distinctions or shades of meaning', example: 'Her nuanced analysis impressed even the senior professors.', pronunciation: 'NYOO-anst' },
    { id: 'v17', word: 'Corroborate', definition: 'Confirm or give support to a statement or theory', example: 'The second witness corroborated the original testimony.', pronunciation: 'kuh-ROB-uh-rate' },
    { id: 'v18', word: 'Paradigm', definition: 'A typical example or pattern of something; a model', example: 'The internet created a new paradigm for global communication.', pronunciation: 'PAIR-uh-dime' },
    { id: 'v19', word: 'Ostensibly', definition: 'Apparently or purportedly, but perhaps not actually', example: 'She was ostensibly calm, but her hands betrayed her nerves.', pronunciation: 'os-TEN-sib-lee' },
    { id: 'v20', word: 'Exacerbate', definition: 'Make a problem, bad situation, or negative feeling worse', example: 'Lack of sleep can exacerbate anxiety and reduce focus.', pronunciation: 'ig-ZAS-er-bate' },
  ],
];

// ─── Grammar Tasks ──────────────────────────────────────────────────────────

interface GrammarItem {
  sentence: string;
  options: string[];
  answer: string;
}

const GRAMMAR_TOPICS: { topic: string; items: GrammarItem[] }[] = [
  {
    topic: 'Subjunctive Mood',
    items: [
      { sentence: 'If I _____ you, I would approach it differently.', options: ['were', 'was', 'am', 'be'], answer: 'were' },
      { sentence: 'She suggested that he _____ the preliminary exam first.', options: ['take', 'takes', 'took', 'taken'], answer: 'take' },
      { sentence: 'It is essential that the final report _____ by Friday.', options: ['be', 'is', 'are', 'been'], answer: 'be' },
      { sentence: 'The committee recommended that she _____ her position.', options: ['resign', 'resigns', 'resigned', 'resigning'], answer: 'resign' },
      { sentence: 'I wish I _____ about this policy change earlier.', options: ['had known', 'knew', 'know', 'have known'], answer: 'had known' },
      { sentence: 'It is crucial that every delegate _____ the document.', options: ['sign', 'signs', 'signed', 'signing'], answer: 'sign' },
      { sentence: 'He demanded that we _____ the premises immediately.', options: ['vacate', 'vacates', 'vacated', 'vacating'], answer: 'vacate' },
      { sentence: 'The board insisted that each proposal _____ evaluated fairly.', options: ['be', 'is', 'was', 'were'], answer: 'be' },
      { sentence: 'If only she _____ the contract before signing it.', options: ['had read', 'read', 'reads', 'have read'], answer: 'had read' },
      { sentence: 'It is imperative that all applications _____ before the deadline.', options: ['be submitted', 'are submitted', 'submit', 'submitted'], answer: 'be submitted' },
    ],
  },
  {
    topic: 'Passive Voice — Advanced',
    items: [
      { sentence: 'The controversial proposal _____ by the entire committee.', options: ['was reviewed', 'reviewed', 'has reviewed', 'is reviewing'], answer: 'was reviewed' },
      { sentence: 'The landmark experiment _____ under strictly controlled conditions.', options: ['was conducted', 'conducted', 'has conducted', 'is conducting'], answer: 'was conducted' },
      { sentence: 'Three major policy changes _____ during last year\'s summit.', options: ['were introduced', 'introduced', 'have introduced', 'are introducing'], answer: 'were introduced' },
      { sentence: 'The ancient manuscript _____ by leading scholars over decades.', options: ['has been examined', 'examined', 'is examining', 'examines'], answer: 'has been examined' },
      { sentence: 'All critical decisions _____ only after thorough deliberation.', options: ['are made', 'make', 'have made', 'made'], answer: 'are made' },
      { sentence: 'The final results _____ in a peer-reviewed journal next month.', options: ['will be published', 'published', 'are publishing', 'have published'], answer: 'will be published' },
      { sentence: 'The infrastructure project _____ over the past three years.', options: ['has been developed', 'has developed', 'developed', 'is developing'], answer: 'has been developed' },
      { sentence: 'By the time we arrived, the agreement _____ already.', options: ['had been signed', 'has been signed', 'was signed', 'signed'], answer: 'had been signed' },
      { sentence: 'Significant improvements _____ since the new system was installed.', options: ['have been made', 'made', 'are making', 'have made'], answer: 'have been made' },
      { sentence: 'The data _____ meticulously by the research team before publication.', options: ['was analyzed', 'analyzed', 'has analyzed', 'is analyzing'], answer: 'was analyzed' },
    ],
  },
  {
    topic: 'Conditional Sentences — Mixed',
    items: [
      { sentence: 'Had I known about the risk, I _____ a different strategy.', options: ['would have chosen', 'would choose', 'will choose', 'chose'], answer: 'would have chosen' },
      { sentence: 'Unless you practice daily, you _____ natural fluency.', options: ['will never achieve', 'never achieve', 'would never achieve', 'had never achieved'], answer: 'will never achieve' },
      { sentence: 'Should the situation deteriorate, we _____ our plans immediately.', options: ['will reconsider', 'reconsidered', 'would reconsider', 'had reconsidered'], answer: 'will reconsider' },
      { sentence: 'Were she to apply for the position, she _____ the best candidate.', options: ['would be', 'will be', 'is', 'had been'], answer: 'would be' },
      { sentence: 'Had they invested more wisely, they _____ this financial crisis.', options: ['would have avoided', 'would avoid', 'avoided', 'will avoid'], answer: 'would have avoided' },
      { sentence: 'Provided that you meet all requirements, you _____ immediately.', options: ['will qualify', 'qualified', 'would qualify', 'had qualified'], answer: 'will qualify' },
      { sentence: 'If it _____ so heavily, we would have completed the outdoor survey.', options: ['had not rained', 'did not rain', 'was not raining', 'is not raining'], answer: 'had not rained' },
      { sentence: 'But for your timely intervention, the entire project _____.', options: ['would have failed', 'would fail', 'failed', 'will fail'], answer: 'would have failed' },
      { sentence: 'Assuming all targets are met, we _____ the new product by Q3.', options: ['will launch', 'launched', 'would launch', 'had launched'], answer: 'will launch' },
      { sentence: 'In the event that you strongly disagree, you _____ a formal objection.', options: ['may submit', 'submitted', 'had submitted', 'would submitted'], answer: 'may submit' },
    ],
  },
  {
    topic: 'Modal Verbs — Advanced Usage',
    items: [
      { sentence: 'You _____ submitted the comprehensive report before leaving.', options: ['should have', 'should', 'had to', 'must'], answer: 'should have' },
      { sentence: 'The preliminary results _____ indicate a statistically significant improvement.', options: ['might', 'must', 'shall', 'ought'], answer: 'might' },
      { sentence: 'They _____ not have overlooked such a fundamental systematic error.', options: ['could', 'should', 'would', 'might'], answer: 'could' },
      { sentence: 'We _____ consider all available alternatives before reaching a final decision.', options: ['ought to', 'might', 'shall', 'used to'], answer: 'ought to' },
      { sentence: 'She _____ have arrived by now; something unexpected must have occurred.', options: ['should', 'could', 'would', 'shall'], answer: 'should' },
      { sentence: 'The critical decision _____ not have been made without comprehensive consultation.', options: ['should', 'could', 'might', 'shall'], answer: 'should' },
      { sentence: 'You _____ have notified the entire team earlier about this organizational change.', options: ['could', 'might', 'shall', 'ought'], answer: 'could' },
      { sentence: 'This deeply complex problem _____ be resolved with proper systematic planning.', options: ['can', 'may', 'shall', 'ought'], answer: 'can' },
      { sentence: 'He _____ speak four languages fluently by the time he was twenty.', options: ['could', 'can', 'may', 'should'], answer: 'could' },
      { sentence: 'We _____ not continue to ignore these persistent and serious warning signs.', options: ['must', 'might', 'shall', 'could'], answer: 'must' },
    ],
  },
];

// ─── Listening Tasks ─────────────────────────────────────────────────────────

interface ListeningPassage {
  text: string;
  questions: { q: string; a: string; opts: string[] }[];
}

const LISTENING_PASSAGES: ListeningPassage[] = [
  {
    text: 'The phenomenon of globalization has fundamentally transformed the way businesses operate across international boundaries. Companies must now navigate complex regulatory environments, diverse cultural expectations, and rapidly evolving market dynamics. Those that successfully adapt tend to develop robust cross-cultural communication strategies and employ professionals with strong multilingual abilities. Furthermore, digital technology has compressed geographical distances, enabling even small enterprises to compete on a global scale.',
    questions: [
      { q: 'What has globalization fundamentally transformed?', a: 'The way businesses operate internationally', opts: ['Local economies only', 'The way businesses operate internationally', 'Government tax regulations', 'Cultural heritage values'] },
      { q: 'What must companies navigate?', a: 'Complex regulatory environments', opts: ['Simple trade rules', 'Complex regulatory environments', 'Easy consumer markets', 'Cultural uniformity'] },
      { q: 'What strategy do successful companies develop?', a: 'Cross-cultural communication strategies', opts: ['Aggressive price-cutting', 'Cross-cultural communication strategies', 'Short-term cost reduction', 'Digital-only advertising'] },
      { q: 'What type of professionals do adaptive companies employ?', a: 'Professionals with strong multilingual abilities', opts: ['Young recent graduates', 'Professionals with strong multilingual abilities', 'Remote workers exclusively', 'Technical software engineers'] },
      { q: 'What has compressed geographical distances?', a: 'Digital technology', opts: ['Air travel', 'Digital technology', 'Trade agreements', 'Financial systems'] },
      { q: 'Who can now compete on a global scale?', a: 'Even small enterprises', opts: ['Only multinational corporations', 'Even small enterprises', 'Government agencies', 'Academic institutions'] },
    ],
  },
  {
    text: 'Technological innovation in artificial intelligence is creating unprecedented opportunities and challenges simultaneously. While automation increases operational efficiency and reduces costs, it also requires workers to continuously adapt their skill sets. Educational institutions are responding by developing curricula that emphasize critical thinking, creativity, and digital literacy — skills that complement rather than compete with machine capabilities. The most resilient employees are those who can collaborate effectively with intelligent systems.',
    questions: [
      { q: 'What is AI innovation creating simultaneously?', a: 'Unprecedented opportunities and challenges', opts: ['Only economic opportunities', 'Only workplace challenges', 'Unprecedented opportunities and challenges', 'Simple productivity solutions'] },
      { q: 'What does automation increase?', a: 'Operational efficiency', opts: ['Workplace complexity only', 'Operational efficiency', 'Employee count', 'Manual task volume'] },
      { q: 'What do workers need to continuously do?', a: 'Adapt their skill sets', opts: ['Seek new employment', 'Resist automation trends', 'Adapt their skill sets', 'Reduce working hours'] },
      { q: 'What do educational curricula now emphasize?', a: 'Critical thinking and digital literacy', opts: ['Only technical coding skills', 'Critical thinking and digital literacy', 'Traditional memorization', 'Physical labor preparation'] },
      { q: 'How are human skills described in relation to machines?', a: 'They complement machine capabilities', opts: ['They replace machines entirely', 'They compete with machines', 'They complement machine capabilities', 'They are inferior to machines'] },
      { q: 'Who are the most resilient employees?', a: 'Those who collaborate effectively with intelligent systems', opts: ['Those who avoid technology', 'Those who collaborate effectively with intelligent systems', 'Those who work the longest hours', 'Those with the most degrees'] },
    ],
  },
  {
    text: 'Environmental sustainability has become a critical priority for both governments and corporations worldwide. Research indicates that proactive climate policies can generate significant economic benefits while preserving natural resources for future generations. Businesses that integrate sustainability into their core strategies report improved brand reputation, increased investor confidence, and long-term operational resilience. The transition to renewable energy sources is no longer merely an ethical choice — it has become a sound economic imperative.',
    questions: [
      { q: 'What have proactive climate policies been shown to generate?', a: 'Significant economic benefits', opts: ['Higher consumer taxes', 'Significant economic benefits', 'Increased industrial pollution', 'Short-term job losses'] },
      { q: 'What do these policies preserve for future generations?', a: 'Natural resources', opts: ['Corporate profit margins', 'Natural resources', 'Current employment levels', 'Government regulatory power'] },
      { q: 'What do businesses integrating sustainability report?', a: 'Improved brand reputation', opts: ['Declining profit margins', 'Improved brand reputation', 'Increased operational costs', 'Reduced production output'] },
      { q: 'What additional benefit do sustainable businesses experience?', a: 'Increased investor confidence', opts: ['Shareholder disputes', 'Increased investor confidence', 'Regulatory penalties', 'Market contraction'] },
      { q: 'How is transitioning to renewable energy now described?', a: 'A sound economic imperative', opts: ['A purely ethical choice', 'A government requirement', 'A sound economic imperative', 'An optional strategy'] },
      { q: 'Who are the two key groups mentioned as prioritizing sustainability?', a: 'Governments and corporations', opts: ['Consumers and individual employees', 'Governments and corporations', 'Scientists and academics', 'Media organizations'] },
    ],
  },
  {
    text: 'The human brain\'s capacity for language acquisition is most powerful during childhood, a period neuroscientists call the "critical window." However, adults retain significant neuroplasticity — the brain\'s ability to form new neural connections — enabling them to master new languages at any age. The key differentiating factor is methodology: adult learners benefit most from immersive, contextual learning that mirrors the way children naturally absorb language through meaningful interaction and repeated exposure.',
    questions: [
      { q: 'When is language acquisition most powerful?', a: 'During childhood', opts: ['During adolescence', 'During childhood', 'In early adulthood', 'At any age equally'] },
      { q: 'What do neuroscientists call this period?', a: 'The critical window', opts: ['The golden age', 'The critical window', 'The prime phase', 'The learning zone'] },
      { q: 'What ability do adults retain?', a: 'Significant neuroplasticity', opts: ['Perfect memory retention', 'Significant neuroplasticity', 'Unlimited vocabulary capacity', 'Automatic language transfer'] },
      { q: 'What methodology benefits adult learners most?', a: 'Immersive, contextual learning', opts: ['Grammar-only drills', 'Immersive, contextual learning', 'Vocabulary memorization lists', 'Translation-based study'] },
      { q: 'How do children naturally absorb language?', a: 'Through meaningful interaction and repeated exposure', opts: ['Through formal grammar lessons', 'Through written exercises', 'Through meaningful interaction and repeated exposure', 'Through standardized testing'] },
      { q: 'What is neuroplasticity?', a: 'The brain\'s ability to form new neural connections', opts: ['A memory enhancement drug', 'The brain\'s ability to form new neural connections', 'A language learning technique', 'A type of critical thinking'] },
    ],
  },
];

// ─── Speaking Tasks ───────────────────────────────────────────────────────────

const SPEAKING_PROMPTS = [
  {
    prompt: 'Discuss the impact of social media on modern communication. Include both positive and negative effects with specific examples.',
    readAloud: 'The capacity for critical thinking is arguably the most valuable skill in the modern workplace. Professionals who can analyze complex information, identify patterns, and draw well-reasoned conclusions are consistently more successful in navigating ambiguous and rapidly changing situations.',
  },
  {
    prompt: 'Describe a significant challenge you have overcome and explain in detail what you learned from that experience.',
    readAloud: 'Globalization has created both extraordinary opportunities and complex challenges for individuals seeking to advance in their careers. Those who develop strong cross-cultural competencies and multilingual communication abilities tend to navigate these dynamics with greater confidence and effectiveness.',
  },
  {
    prompt: 'Argue for or against this proposition: "Remote work is fundamentally more productive than traditional office-based work." Justify your position.',
    readAloud: 'Technological innovation continues to reshape every dimension of human experience. The most successful adapters are those who embrace continuous learning, remain intellectually curious, and actively develop skills that complement — rather than compete with — emerging artificial intelligence capabilities.',
  },
  {
    prompt: 'Explain how technology has transformed education over the past decade and predict the most significant trends for the next ten years.',
    readAloud: 'Environmental sustainability is no longer merely an ethical consideration — it has become a strategic economic imperative. Organizations that proactively integrate sustainable practices into their core operations consistently report stronger investor confidence, enhanced brand reputation, and greater long-term operational resilience.',
  },
];

// ─── Task Generators ──────────────────────────────────────────────────────────

function generateGrammarTasks(day: number): Task[] {
  const topicIdx = (day - 1) % GRAMMAR_TOPICS.length;
  const { topic, items } = GRAMMAR_TOPICS[topicIdx];

  return items.map((item, i) => ({
    id: `grammar_${day}_${i}`,
    type: 'grammar' as const,
    difficulty: i < 3 ? 'medium' : i < 7 ? 'hard' : 'advanced',
    instruction: `Choose the correct form. Topic: ${topic}`,
    content: item.sentence,
    options: item.options,
    correctAnswer: item.answer,
    xp: i < 3 ? 10 : i < 7 ? 15 : 20,
  }));
}

function generateListeningTasks(day: number): Task[] {
  const passage = LISTENING_PASSAGES[(day - 1) % LISTENING_PASSAGES.length];

  return passage.questions.map((q, i) => ({
    id: `listening_${day}_${i}`,
    type: 'listening' as const,
    difficulty: i < 2 ? 'medium' : i < 4 ? 'hard' : 'advanced',
    instruction: 'Listen to the passage carefully, then select the correct answer.',
    content: q.q,
    audioText: passage.text,
    options: q.opts,
    correctAnswer: q.a,
    xp: 12 + Math.floor(i / 2) * 4,
  }));
}

function generateSpeakingTasks(day: number): Task[] {
  const p = SPEAKING_PROMPTS[(day - 1) % SPEAKING_PROMPTS.length];

  return [
    {
      id: `speaking_${day}_0`,
      type: 'speaking' as const,
      difficulty: 'advanced',
      instruction: 'Speak clearly for 60–90 seconds on the topic. Use the Listen button to hear the prompt first.',
      content: p.prompt,
      speakingPrompt: p.prompt,
      audioText: p.prompt,
      xp: 25,
    },
    {
      id: `speaking_${day}_1`,
      type: 'speaking' as const,
      difficulty: 'advanced',
      instruction: 'Read the following paragraph aloud with natural intonation, appropriate pacing, and clear articulation.',
      content: p.readAloud,
      audioText: p.readAloud,
      xp: 20,
    },
  ];
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function getLesson(week: number, day: number): DailyLesson {
  const ebVideo = ENGLISHBAY_VIDEOS[(day - 1) % ENGLISHBAY_VIDEOS.length];
  const compIdx = ((week - 1) * 7 + (day - 1)) * 2;
  const comp1 = COMPLEMENTARY_VIDEOS[compIdx % COMPLEMENTARY_VIDEOS.length];
  const comp2 = COMPLEMENTARY_VIDEOS[(compIdx + 1) % COMPLEMENTARY_VIDEOS.length];

  const grammarTasks = generateGrammarTasks(day);   // 10 tasks
  const listeningTasks = generateListeningTasks(day); // 6 tasks
  const speakingTasks = generateSpeakingTasks(day);   // 2 tasks

  // Extra listening tasks re-tagged so IDs stay unique — total = 10 + 6 + 2 + 2 = 20
  const bonusListening = listeningTasks.slice(0, 2).map((t, i) => ({
    ...t,
    id: `bonus_${day}_${i}`,
    instruction: 'Listen again and re-answer from memory (no replaying this time).',
  }));

  const allTasks = [
    ...grammarTasks,
    ...listeningTasks,
    ...speakingTasks,
    ...bonusListening,
  ].slice(0, 20);

  const vocabSet = VOCAB_BANKS[(((week - 1) * 7) + (day - 1)) % VOCAB_BANKS.length];

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
