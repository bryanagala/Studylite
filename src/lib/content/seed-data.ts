import type {
  Achievement,
  Difficulty,
  Lesson,
  LessonSection,
  Question,
  Subject,
  Topic,
} from "@/lib/types";

function sections(
  items: Array<[string, string, string?, string?]>
): LessonSection[] {
  return items.map(([heading, body, keyConcept, remember]) => ({
    heading,
    body,
    keyConcept,
    remember,
  }));
}

function q(
  id: string,
  lessonId: string,
  topicId: string,
  questionText: string,
  options: string[],
  correctAnswer: string,
  explanation: string,
  questionType: "multiple_choice" | "true_false" = "multiple_choice",
  difficulty: Difficulty = "easy"
): Question {
  return {
    id,
    lessonId,
    topicId,
    questionText,
    questionType,
    options,
    correctAnswer,
    explanation,
    difficulty,
  };
}

export const SUBJECTS: Subject[] = [
  {
    id: "sub-math",
    name: "Mathematics",
    description: "Algebra, geometry, and numbers that power exams.",
    icon: "📐",
  },
  {
    id: "sub-bio",
    name: "Biology",
    description: "Cells, genetics, and how living systems work.",
    icon: "🧬",
  },
  {
    id: "sub-eng",
    name: "English Language",
    description: "Grammar, vocabulary, and clear communication.",
    icon: "📚",
  },
  {
    id: "sub-cs",
    name: "Computer Science",
    description: "Computing basics, logic, and problem-solving.",
    icon: "💻",
  },
];

export const TOPICS: Topic[] = [
  // Math
  { id: "topic-math-algebra", subjectId: "sub-math", name: "Algebra Basics", description: "Variables, equations, and expressions." },
  { id: "topic-math-geometry", subjectId: "sub-math", name: "Geometry", description: "Shapes, angles, and area." },
  { id: "topic-math-numbers", subjectId: "sub-math", name: "Number Systems", description: "Fractions, ratios, and percentages." },
  // Biology
  { id: "topic-bio-cells", subjectId: "sub-bio", name: "Cell Biology", description: "Structure and function of cells." },
  { id: "topic-bio-repro", subjectId: "sub-bio", name: "Human Reproduction", description: "Male and female reproductive systems." },
  { id: "topic-bio-genetics", subjectId: "sub-bio", name: "Genetics", description: "Inheritance and genetic variation." },
  // English
  { id: "topic-eng-grammar", subjectId: "sub-eng", name: "Grammar", description: "Parts of speech and sentence structure." },
  { id: "topic-eng-vocab", subjectId: "sub-eng", name: "Vocabulary", description: "Word meanings and usage." },
  { id: "topic-eng-comprehension", subjectId: "sub-eng", name: "Comprehension", description: "Reading for meaning." },
  // CS
  { id: "topic-cs-basics", subjectId: "sub-cs", name: "Computing Basics", description: "Hardware, software, and data." },
  { id: "topic-cs-algorithms", subjectId: "sub-cs", name: "Algorithms", description: "Steps for solving problems." },
  { id: "topic-cs-networks", subjectId: "sub-cs", name: "Networks & Internet", description: "How devices connect and share data." },
];

export const LESSONS: Lesson[] = [
  // Biology - Cell Biology
  {
    id: "lesson-bio-intro-cells",
    topicId: "topic-bio-cells",
    title: "Introduction to Cells",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      [
        "What is a Cell?",
        "A cell is the basic structural and functional unit of life. All living organisms are made of one or more cells.",
        "Cells carry out life processes like growth, respiration, and reproduction.",
      ],
      [
        "Types of Cells",
        "Organisms may be unicellular (one cell) or multicellular (many cells). Animal and plant cells share many features but also differ in important ways.",
        undefined,
        "Unicellular organisms include bacteria and amoeba.",
      ],
      [
        "Why Cells Matter",
        "Understanding cells helps explain how tissues, organs, and systems work together in the body.",
      ],
    ]),
  },
  {
    id: "lesson-bio-organelles",
    topicId: "topic-bio-cells",
    title: "Cell Organelles",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      [
        "Organelles Overview",
        "Organelles are specialized structures inside cells that perform distinct jobs, like departments in a factory.",
      ],
      [
        "Mitochondria & Nucleus",
        "Mitochondria release energy through respiration. The nucleus stores genetic material and controls cell activities.",
        "The cell membrane controls what enters and leaves the cell.",
        "Mitochondria are responsible for producing energy for the cell.",
      ],
      [
        "Other Key Parts",
        "Ribosomes make proteins. The Golgi apparatus packages and ships materials. Chloroplasts (in plants) capture light for photosynthesis.",
      ],
    ]),
  },
  // Biology - Reproduction
  {
    id: "lesson-bio-male-repro",
    topicId: "topic-bio-repro",
    title: "Male Reproductive System",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      [
        "Main Organs",
        "The male reproductive system includes the testes, penis, and ducts that carry sperm.",
        "Testes produce sperm and the hormone testosterone.",
      ],
      [
        "Sperm Production",
        "Sperm are produced in the testes and mature as they travel through the epididymis.",
        undefined,
        "Sperm are male gametes.",
      ],
    ]),
  },
  {
    id: "lesson-bio-female-repro",
    topicId: "topic-bio-repro",
    title: "Female Reproductive System",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      [
        "Main Organs",
        "Key organs include the ovaries, fallopian tubes, uterus, and vagina.",
        "Ovaries produce eggs (ova) and hormones such as estrogen.",
      ],
      [
        "Fertilization Pathway",
        "An egg may be fertilized in the fallopian tube. The uterus is where a fertilized egg can implant and develop.",
        undefined,
        "The uterus is adapted for pregnancy.",
      ],
    ]),
  },
  // Biology - Genetics
  {
    id: "lesson-bio-intro-genetics",
    topicId: "topic-bio-genetics",
    title: "Introduction to Genetics",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      [
        "What is Genetics?",
        "Genetics is the study of genes, heredity, and how traits are passed from parents to offspring.",
        "Genes are segments of DNA that code for traits.",
      ],
      [
        "DNA Basics",
        "DNA carries genetic instructions. Chromosomes are structures that package DNA inside the nucleus.",
        undefined,
        "Humans typically have 23 pairs of chromosomes.",
      ],
    ]),
  },
  {
    id: "lesson-bio-inheritance",
    topicId: "topic-bio-genetics",
    title: "Inheritance",
    estimatedMinutes: 7,
    difficulty: "medium",
    content: sections([
      [
        "Dominant & Recessive",
        "A dominant allele can express its trait with one copy. A recessive allele usually needs two copies to show.",
      ],
      [
        "Simple Crosses",
        "Punnett squares help predict the chance of offspring inheriting particular allele combinations.",
        "Genotype is the genetic makeup; phenotype is the observable trait.",
      ],
    ]),
  },
  // Math
  {
    id: "lesson-math-variables",
    topicId: "topic-math-algebra",
    title: "Variables & Expressions",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["What is a Variable?", "A variable is a symbol (often x or y) that stands for an unknown number.", "Expressions combine numbers, variables, and operations."],
      ["Simplifying", "Combine like terms: 2x + 3x = 5x. Constants combine separately from variable terms."],
    ]),
  },
  {
    id: "lesson-math-equations",
    topicId: "topic-math-algebra",
    title: "Solving Linear Equations",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Balance Method", "Whatever you do to one side of an equation, do to the other to keep it balanced."],
      ["Example", "Solve x + 5 = 12 by subtracting 5 from both sides: x = 7.", "Isolate the variable step by step.", "Check by substituting back into the original equation."],
    ]),
  },
  {
    id: "lesson-math-angles",
    topicId: "topic-math-geometry",
    title: "Angles & Lines",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Angle Types", "Acute < 90°, right = 90°, obtuse between 90° and 180°, straight = 180°."],
      ["Straight Line", "Angles on a straight line add up to 180°.", undefined, "Vertically opposite angles are equal."],
    ]),
  },
  {
    id: "lesson-math-area",
    topicId: "topic-math-geometry",
    title: "Area of Shapes",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Rectangles & Triangles", "Rectangle area = length × width. Triangle area = ½ × base × height."],
      ["Circles", "Area of a circle = πr². Circumference = 2πr.", "Always use consistent units."],
    ]),
  },
  {
    id: "lesson-math-fractions",
    topicId: "topic-math-numbers",
    title: "Fractions & Decimals",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Equivalence", "1/2 = 0.5 = 50%. Fractions, decimals, and percentages represent parts of a whole."],
      ["Operations", "To add fractions, use a common denominator. Multiply numerators and denominators when multiplying."],
    ]),
  },
  {
    id: "lesson-math-percentages",
    topicId: "topic-math-numbers",
    title: "Percentages & Ratios",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Finding a Percentage", "10% of 80 = 8. Multiply the amount by the percentage as a decimal."],
      ["Ratios", "A ratio compares quantities. Simplify 10:15 to 2:3 by dividing by 5.", undefined, "Part-to-whole vs part-to-part matters in word problems."],
    ]),
  },
  // English
  {
    id: "lesson-eng-parts-speech",
    topicId: "topic-eng-grammar",
    title: "Parts of Speech",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Core Parts", "Nouns name things. Verbs show actions or states. Adjectives describe nouns. Adverbs often describe verbs."],
      ["Quick Check", "In “She quickly wrote a long letter,” quickly is an adverb and long is an adjective."],
    ]),
  },
  {
    id: "lesson-eng-sentences",
    topicId: "topic-eng-grammar",
    title: "Sentence Structure",
    estimatedMinutes: 5,
    difficulty: "medium",
    content: sections([
      ["Subject & Predicate", "A complete sentence needs a subject and a predicate (what the subject does or is)."],
      ["Common Errors", "Avoid run-ons and fragments. Use punctuation to separate complete ideas.", "A fragment is an incomplete sentence."],
    ]),
  },
  {
    id: "lesson-eng-word-power",
    topicId: "topic-eng-vocab",
    title: "Word Meanings",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Context Clues", "Use nearby words to infer meaning when you meet an unfamiliar word."],
      ["Synonyms & Antonyms", "Synonyms have similar meanings; antonyms have opposite meanings."],
    ]),
  },
  {
    id: "lesson-eng-figures",
    topicId: "topic-eng-vocab",
    title: "Figurative Language",
    estimatedMinutes: 5,
    difficulty: "medium",
    content: sections([
      ["Simile & Metaphor", "Simile uses like/as (“brave as a lion”). Metaphor says one thing is another (“time is a thief”)."],
      ["Why It Matters", "Figurative language creates imagery and stronger expression in writing."],
    ]),
  },
  {
    id: "lesson-eng-main-idea",
    topicId: "topic-eng-comprehension",
    title: "Finding the Main Idea",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Main Idea vs Details", "The main idea is the central point. Supporting details explain or prove it."],
      ["Strategy", "Ask: What is this paragraph mostly about? Then verify with key sentences."],
    ]),
  },
  {
    id: "lesson-eng-inference",
    topicId: "topic-eng-comprehension",
    title: "Making Inferences",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Read Between Lines", "An inference is a logical conclusion based on text evidence plus what you already know."],
      ["Evidence First", "Always point to words or clues in the passage that support your inference."],
    ]),
  },
  // CS
  {
    id: "lesson-cs-hardware",
    topicId: "topic-cs-basics",
    title: "Hardware & Software",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Hardware", "Hardware is the physical parts of a computer: CPU, memory, storage, and peripherals."],
      ["Software", "Software is the programs and instructions that tell hardware what to do.", "The CPU is often called the brain of the computer."],
    ]),
  },
  {
    id: "lesson-cs-data",
    topicId: "topic-cs-basics",
    title: "Data & Binary",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Bits & Bytes", "Computers store data as binary (0s and 1s). A bit is one binary digit; a byte is typically 8 bits."],
      ["Why Binary?", "Electronic circuits easily represent two states: on and off."],
    ]),
  },
  {
    id: "lesson-cs-algo-intro",
    topicId: "topic-cs-algorithms",
    title: "What is an Algorithm?",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Definition", "An algorithm is a clear, step-by-step procedure for solving a problem or completing a task."],
      ["Good Algorithms", "They should be precise, finite, and produce a correct result for valid inputs."],
    ]),
  },
  {
    id: "lesson-cs-flowcharts",
    topicId: "topic-cs-algorithms",
    title: "Flowcharts & Pseudocode",
    estimatedMinutes: 6,
    difficulty: "medium",
    content: sections([
      ["Flowcharts", "Flowcharts use shapes to show sequence, decisions, and processes visually."],
      ["Pseudocode", "Pseudocode describes algorithms in structured plain language before real coding."],
    ]),
  },
  {
    id: "lesson-cs-internet",
    topicId: "topic-cs-networks",
    title: "How the Internet Works",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Networks", "A network connects devices so they can share data. The internet is a global network of networks."],
      ["IP & Packets", "Data often travels in packets. IP addresses help route packets to the right device."],
    ]),
  },
  {
    id: "lesson-cs-safety",
    topicId: "topic-cs-networks",
    title: "Online Safety Basics",
    estimatedMinutes: 5,
    difficulty: "easy",
    content: sections([
      ["Threats", "Phishing, malware, and weak passwords are common risks online."],
      ["Good Habits", "Use strong unique passwords, think before clicking links, and keep software updated.", undefined, "Never share passwords or one-time codes."],
    ]),
  },
];

const QUESTION_BANK: Record<string, Array<Omit<Question, "id" | "lessonId" | "topicId">>> = {
  "lesson-bio-intro-cells": [
    { questionText: "What is the basic structural and functional unit of life?", options: ["Tissue", "Organ", "Cell", "Organism"], correctAnswer: "Cell", explanation: "All living things are made of cells, the basic unit of life.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "An organism made of only one cell is called unicellular.", options: ["True", "False"], correctAnswer: "True", explanation: "Unicellular organisms consist of a single cell.", questionType: "true_false", difficulty: "easy" },
    { questionText: "Which of the following is multicellular?", options: ["Amoeba", "Bacteria", "Human", "Yeast (single cell)"], correctAnswer: "Human", explanation: "Humans are made of many specialized cells.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Cells can carry out life processes such as growth and respiration.", options: ["True", "False"], correctAnswer: "True", explanation: "Cells perform essential life functions.", questionType: "true_false", difficulty: "easy" },
    { questionText: "Why do biologists study cells?", options: ["To ignore organs", "To understand how living systems work", "To replace physics", "To avoid chemistry"], correctAnswer: "To understand how living systems work", explanation: "Cell knowledge explains tissues, organs, and body systems.", questionType: "multiple_choice", difficulty: "medium" },
  ],
  "lesson-bio-organelles": [
    { questionText: "Which organelle is known as the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], correctAnswer: "Mitochondria", explanation: "Mitochondria produce most of the cell's usable energy.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "The nucleus stores genetic material.", options: ["True", "False"], correctAnswer: "True", explanation: "DNA is housed in the nucleus of eukaryotic cells.", questionType: "true_false", difficulty: "easy" },
    { questionText: "What does the cell membrane do?", options: ["Makes proteins", "Controls what enters and leaves the cell", "Stores sunlight", "Digests food only"], correctAnswer: "Controls what enters and leaves the cell", explanation: "It is selectively permeable.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Ribosomes are mainly involved in:", options: ["Protein synthesis", "Photosynthesis", "Waste removal", "Cell division only"], correctAnswer: "Protein synthesis", explanation: "Ribosomes assemble proteins.", questionType: "multiple_choice", difficulty: "medium" },
    { questionText: "Chloroplasts are found in animal cells.", options: ["True", "False"], correctAnswer: "False", explanation: "Chloroplasts are typical of plant cells for photosynthesis.", questionType: "true_false", difficulty: "easy" },
  ],
  "lesson-bio-male-repro": [
    { questionText: "Where are sperm produced?", options: ["Prostate", "Testes", "Bladder", "Ureter"], correctAnswer: "Testes", explanation: "The testes produce sperm and testosterone.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Sperm are male gametes.", options: ["True", "False"], correctAnswer: "True", explanation: "Gametes are sex cells; sperm are male gametes.", questionType: "true_false", difficulty: "easy" },
    { questionText: "Which hormone is mainly produced by the testes?", options: ["Estrogen", "Insulin", "Testosterone", "Adrenaline"], correctAnswer: "Testosterone", explanation: "Testosterone is the primary male sex hormone.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "The epididymis helps sperm mature and be stored.", options: ["True", "False"], correctAnswer: "True", explanation: "Sperm mature in the epididymis.", questionType: "true_false", difficulty: "medium" },
    { questionText: "Which is part of the male reproductive system?", options: ["Ovary", "Uterus", "Penis", "Fallopian tube"], correctAnswer: "Penis", explanation: "The penis is a male reproductive organ.", questionType: "multiple_choice", difficulty: "easy" },
  ],
  "lesson-bio-female-repro": [
    { questionText: "Where are eggs produced?", options: ["Uterus", "Ovaries", "Cervix", "Vagina"], correctAnswer: "Ovaries", explanation: "Ovaries produce ova and hormones.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Fertilization usually occurs in the uterus.", options: ["True", "False"], correctAnswer: "False", explanation: "Fertilization typically occurs in the fallopian tube.", questionType: "true_false", difficulty: "medium" },
    { questionText: "Which organ is adapted for pregnancy?", options: ["Ovary", "Fallopian tube", "Uterus", "Cervix only"], correctAnswer: "Uterus", explanation: "The uterus supports implanted embryo development.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Estrogen is produced by the ovaries.", options: ["True", "False"], correctAnswer: "True", explanation: "Ovaries secrete estrogen and progesterone.", questionType: "true_false", difficulty: "easy" },
    { questionText: "The fallopian tubes connect the ovaries to the:", options: ["Bladder", "Uterus", "Kidney", "Stomach"], correctAnswer: "Uterus", explanation: "Eggs travel from ovary toward uterus via fallopian tubes.", questionType: "multiple_choice", difficulty: "easy" },
  ],
  "lesson-bio-intro-genetics": [
    { questionText: "Genetics is the study of:", options: ["Rocks", "Heredity and genes", "Weather only", "Planets"], correctAnswer: "Heredity and genes", explanation: "Genetics explores how traits are inherited.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Genes are segments of DNA.", options: ["True", "False"], correctAnswer: "True", explanation: "Genes are DNA segments that code for traits.", questionType: "true_false", difficulty: "easy" },
    { questionText: "DNA is mainly found in the:", options: ["Cell membrane", "Nucleus", "Vacuole", "Cytoplasm only"], correctAnswer: "Nucleus", explanation: "In eukaryotes, most DNA is in the nucleus.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Humans typically have 23 pairs of chromosomes.", options: ["True", "False"], correctAnswer: "True", explanation: "Most human cells have 46 chromosomes (23 pairs).", questionType: "true_false", difficulty: "easy" },
    { questionText: "Chromosomes package:", options: ["Lipids only", "DNA", "Water", "Glucose only"], correctAnswer: "DNA", explanation: "Chromosomes are DNA packaged with proteins.", questionType: "multiple_choice", difficulty: "medium" },
  ],
  "lesson-bio-inheritance": [
    { questionText: "A dominant allele usually needs two copies to show.", options: ["True", "False"], correctAnswer: "False", explanation: "A dominant allele can show with one copy.", questionType: "true_false", difficulty: "medium" },
    { questionText: "Observable traits are called the:", options: ["Genotype", "Phenotype", "Allele", "Chromosome"], correctAnswer: "Phenotype", explanation: "Phenotype is what you can observe.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "Punnett squares help predict inheritance chances.", options: ["True", "False"], correctAnswer: "True", explanation: "They model possible allele combinations.", questionType: "true_false", difficulty: "easy" },
    { questionText: "Genetic makeup is called the:", options: ["Phenotype", "Habitat", "Genotype", "Species"], correctAnswer: "Genotype", explanation: "Genotype is the allele combination.", questionType: "multiple_choice", difficulty: "easy" },
    { questionText: "A recessive trait usually appears when:", options: ["One dominant allele is present", "Two recessive alleles are present", "No alleles exist", "Only RNA is present"], correctAnswer: "Two recessive alleles are present", explanation: "Recessive alleles are typically masked by a dominant allele.", questionType: "multiple_choice", difficulty: "medium" },
  ],
};

function defaultQuestionsForLesson(lesson: Lesson): Question[] {
  const templates: Array<Omit<Question, "id" | "lessonId" | "topicId">> = [
    {
      questionText: `What is the main focus of the lesson "${lesson.title}"?`,
      options: [lesson.title, "Unrelated history", "Sports rules", "Cooking methods"],
      correctAnswer: lesson.title,
      explanation: `This lesson centers on ${lesson.title.toLowerCase()}.`,
      questionType: "multiple_choice",
      difficulty: "easy",
    },
    {
      questionText: `${lesson.content[0]?.heading || "The first idea"} is an important concept in this lesson.`,
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "Key section headings highlight core ideas to remember.",
      questionType: "true_false",
      difficulty: "easy",
    },
    {
      questionText: lesson.content[0]?.keyConcept
        ? "Which statement best matches a key concept from the lesson?"
        : "Which study habit helps most after this lesson?",
      options: lesson.content[0]?.keyConcept
        ? [lesson.content[0].keyConcept, "Ignore practice questions", "Skip review", "Memorize unrelated dates"]
        : ["Take a short quiz", "Never review", "Avoid examples", "Study only once a year"],
      correctAnswer: lesson.content[0]?.keyConcept || "Take a short quiz",
      explanation: "Active recall after a short lesson strengthens memory.",
      questionType: "multiple_choice",
      difficulty: "medium",
    },
    {
      questionText: "Short lessons plus immediate practice improve retention.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "Spaced, active practice beats passive rereading.",
      questionType: "true_false",
      difficulty: "easy",
    },
    {
      questionText: `About how long is "${lesson.title}" estimated to take?`,
      options: [`${lesson.estimatedMinutes} minutes`, "2 hours", "1 day", "30 seconds"],
      correctAnswer: `${lesson.estimatedMinutes} minutes`,
      explanation: "Each StudyLite lesson is designed as a short focused session.",
      questionType: "multiple_choice",
      difficulty: "easy",
    },
  ];

  // Subject-flavored extras replace generic ones for non-bio when possible
  const flavor: Record<string, Array<Omit<Question, "id" | "lessonId" | "topicId">>> = {
    "lesson-math-variables": [
      { questionText: "In algebra, a variable commonly represents:", options: ["A fixed label only", "An unknown number", "A shape", "A unit of time"], correctAnswer: "An unknown number", explanation: "Variables stand for numbers we may not know yet.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "2x + 3x simplifies to 5x.", options: ["True", "False"], correctAnswer: "True", explanation: "Like terms with x combine by adding coefficients.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is an algebraic expression?", options: ["3x + 2", "Hello", "True/False", "A paragraph"], correctAnswer: "3x + 2", explanation: "Expressions combine numbers, variables, and operations.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Constants and variable terms are combined the same way always.", options: ["True", "False"], correctAnswer: "False", explanation: "Only like terms combine; constants combine with constants.", questionType: "true_false", difficulty: "medium" },
      { questionText: "Simplify: 4y − y", options: ["3y", "5y", "4", "y"], correctAnswer: "3y", explanation: "4y − 1y = 3y.", questionType: "multiple_choice", difficulty: "easy" },
    ],
    "lesson-math-equations": [
      { questionText: "Solve: x + 5 = 12", options: ["5", "7", "12", "17"], correctAnswer: "7", explanation: "Subtract 5 from both sides: x = 7.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "You must do the same operation to both sides of an equation.", options: ["True", "False"], correctAnswer: "True", explanation: "This keeps the equation balanced.", questionType: "true_false", difficulty: "easy" },
      { questionText: "To solve x − 3 = 10, you should:", options: ["Subtract 3", "Add 3", "Multiply by 3", "Divide by 10"], correctAnswer: "Add 3", explanation: "Add 3 to both sides to isolate x.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Checking a solution by substitution is useful.", options: ["True", "False"], correctAnswer: "True", explanation: "Substitution verifies correctness.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Solve: 2x = 10", options: ["2", "5", "8", "12"], correctAnswer: "5", explanation: "Divide both sides by 2.", questionType: "multiple_choice", difficulty: "easy" },
    ],
    "lesson-math-angles": [
      { questionText: "A right angle measures:", options: ["45°", "90°", "180°", "360°"], correctAnswer: "90°", explanation: "Right angles are exactly 90 degrees.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Angles on a straight line add to 180°.", options: ["True", "False"], correctAnswer: "True", explanation: "A straight angle is 180°.", questionType: "true_false", difficulty: "easy" },
      { questionText: "An angle of 120° is:", options: ["Acute", "Right", "Obtuse", "Reflex only"], correctAnswer: "Obtuse", explanation: "Obtuse angles are between 90° and 180°.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Vertically opposite angles are equal.", options: ["True", "False"], correctAnswer: "True", explanation: "When two lines cross, opposite angles match.", questionType: "true_false", difficulty: "medium" },
      { questionText: "An acute angle is:", options: ["Less than 90°", "Exactly 90°", "More than 180°", "Exactly 180°"], correctAnswer: "Less than 90°", explanation: "Acute means less than a right angle.", questionType: "multiple_choice", difficulty: "easy" },
    ],
    "lesson-math-area": [
      { questionText: "Area of a rectangle 4 by 3 is:", options: ["7", "12", "14", "1"], correctAnswer: "12", explanation: "Area = length × width = 12.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Triangle area uses ½ × base × height.", options: ["True", "False"], correctAnswer: "True", explanation: "That is the standard triangle area formula.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Area of a circle is:", options: ["2πr", "πr²", "πd", "r² only"], correctAnswer: "πr²", explanation: "Circle area equals pi times radius squared.", questionType: "multiple_choice", difficulty: "medium" },
      { questionText: "Units must be consistent when calculating area.", options: ["True", "False"], correctAnswer: "True", explanation: "Mixed units produce wrong results.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Circumference of a circle is:", options: ["πr²", "2πr", "l × w", "½bh"], correctAnswer: "2πr", explanation: "Circumference = 2πr (or πd).", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-math-fractions": [
      { questionText: "1/2 as a decimal is:", options: ["0.2", "0.5", "1.2", "2.0"], correctAnswer: "0.5", explanation: "One half equals 0.5.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "50% equals 1/2.", options: ["True", "False"], correctAnswer: "True", explanation: "Percent means per hundred; 50/100 = 1/2.", questionType: "true_false", difficulty: "easy" },
      { questionText: "To add fractions you often need a:", options: ["Common denominator", "Square root", "Prime only", "Variable"], correctAnswer: "Common denominator", explanation: "Same denominators allow numerators to add.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "When multiplying fractions, multiply numerators and denominators.", options: ["True", "False"], correctAnswer: "True", explanation: "That is the standard multiplication rule.", questionType: "true_false", difficulty: "easy" },
      { questionText: "3/4 as a percentage is:", options: ["34%", "43%", "75%", "7.5%"], correctAnswer: "75%", explanation: "3 ÷ 4 = 0.75 = 75%.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-math-percentages": [
      { questionText: "10% of 80 is:", options: ["8", "10", "18", "80"], correctAnswer: "8", explanation: "0.10 × 80 = 8.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "A ratio compares quantities.", options: ["True", "False"], correctAnswer: "True", explanation: "Ratios show relative sizes.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Simplify 10:15", options: ["1:2", "2:3", "5:10", "10:5"], correctAnswer: "2:3", explanation: "Divide both parts by 5.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "25% of 40 is 10.", options: ["True", "False"], correctAnswer: "True", explanation: "0.25 × 40 = 10.", questionType: "true_false", difficulty: "easy" },
      { questionText: "To find 20% as a decimal use:", options: ["20", "2", "0.2", "0.02"], correctAnswer: "0.2", explanation: "Percent ÷ 100 gives the decimal.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-eng-parts-speech": [
      { questionText: "Which word is a noun?", options: ["quickly", "beautiful", "school", "run (as verb)"], correctAnswer: "school", explanation: "School names a place/thing.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Adjectives describe nouns.", options: ["True", "False"], correctAnswer: "True", explanation: "Adjectives modify nouns.", questionType: "true_false", difficulty: "easy" },
      { questionText: "In “She quickly wrote,” quickly is an:", options: ["Noun", "Adjective", "Adverb", "Pronoun"], correctAnswer: "Adverb", explanation: "It describes how she wrote.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Verbs show actions or states.", options: ["True", "False"], correctAnswer: "True", explanation: "Verbs are doing/being words.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is an adjective?", options: ["run", "long", "slowly", "and"], correctAnswer: "long", explanation: "Long describes a noun (e.g., long letter).", questionType: "multiple_choice", difficulty: "easy" },
    ],
    "lesson-eng-sentences": [
      { questionText: "A complete sentence needs a subject and predicate.", options: ["True", "False"], correctAnswer: "True", explanation: "Both parts make a complete thought.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A sentence fragment is:", options: ["A complete thought", "An incomplete sentence", "Always a question", "Only a paragraph"], correctAnswer: "An incomplete sentence", explanation: "Fragments miss essential parts.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Run-on sentences should be corrected with proper punctuation or conjunctions.", options: ["True", "False"], correctAnswer: "True", explanation: "They improperly join independent clauses.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is a complete sentence?", options: ["When she arrived", "The student studied.", "After the rain", "Because of traffic"], correctAnswer: "The student studied.", explanation: "It has subject and predicate.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "The predicate tells what the subject does or is.", options: ["True", "False"], correctAnswer: "True", explanation: "Predicate contains the verb phrase.", questionType: "true_false", difficulty: "easy" },
    ],
    "lesson-eng-word-power": [
      { questionText: "Context clues help you infer word meaning.", options: ["True", "False"], correctAnswer: "True", explanation: "Nearby words provide hints.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A synonym has a:", options: ["Opposite meaning", "Similar meaning", "No meaning", "Only sound alike"], correctAnswer: "Similar meaning", explanation: "Synonyms are similar in meaning.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Antonyms are opposite in meaning.", options: ["True", "False"], correctAnswer: "True", explanation: "Hot/cold are antonyms.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Best synonym for “happy”:", options: ["Sad", "Joyful", "Angry", "Tired"], correctAnswer: "Joyful", explanation: "Joyful means similarly pleased/happy.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Using a dictionary can confirm inferred meanings.", options: ["True", "False"], correctAnswer: "True", explanation: "Verification improves accuracy.", questionType: "true_false", difficulty: "easy" },
    ],
    "lesson-eng-figures": [
      { questionText: "“Brave as a lion” is a:", options: ["Metaphor", "Simile", "Hyperbole only", "Fragment"], correctAnswer: "Simile", explanation: "Similes use like or as.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "“Time is a thief” is a metaphor.", options: ["True", "False"], correctAnswer: "True", explanation: "It equates time with a thief without like/as.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Figurative language mainly helps create:", options: ["Imagery and expression", "Only grammar rules", "Math formulas", "File storage"], correctAnswer: "Imagery and expression", explanation: "It makes writing vivid.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Similes never use “like” or “as.”", options: ["True", "False"], correctAnswer: "False", explanation: "Similes typically use like/as.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is figurative?", options: ["The bag weighs 2 kg", "Her smile lit the room", "Water boils at 100°C", "There are 12 months"], correctAnswer: "Her smile lit the room", explanation: "It uses figurative imagery, not literal light.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-eng-main-idea": [
      { questionText: "The main idea is the central point of a text.", options: ["True", "False"], correctAnswer: "True", explanation: "Details support that central point.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Supporting details:", options: ["Replace the title", "Explain or prove the main idea", "Are always opinions", "Are unrelated facts"], correctAnswer: "Explain or prove the main idea", explanation: "They back up the core message.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Asking “What is this mostly about?” helps find the main idea.", options: ["True", "False"], correctAnswer: "True", explanation: "It focuses attention on the core message.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Main idea is the same as every minor detail.", options: ["True", "False"], correctAnswer: "False", explanation: "Details support; they are not the main idea itself.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Best first step for main idea:", options: ["Ignore headings", "Skim for central message then verify", "Memorize every adjective", "Count commas"], correctAnswer: "Skim for central message then verify", explanation: "Identify the claim, then confirm with evidence.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-eng-inference": [
      { questionText: "An inference is a logical conclusion from evidence.", options: ["True", "False"], correctAnswer: "True", explanation: "You combine text clues with reasoning.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Good inferences should be supported by:", options: ["Guesses only", "Text evidence", "Random opinions", "Unrelated news"], correctAnswer: "Text evidence", explanation: "Point to clues in the passage.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Reading between the lines means inventing facts with no clues.", options: ["True", "False"], correctAnswer: "False", explanation: "Inferences still need textual support.", questionType: "true_false", difficulty: "medium" },
      { questionText: "If a character “slams the door and refuses to speak,” you might infer they are:", options: ["Calm", "Upset", "Sleepy for sure", "Hungry only"], correctAnswer: "Upset", explanation: "Actions suggest strong negative emotion.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Evidence-first reading improves inference accuracy.", options: ["True", "False"], correctAnswer: "True", explanation: "Anchor conclusions in the text.", questionType: "true_false", difficulty: "easy" },
    ],
    "lesson-cs-hardware": [
      { questionText: "Hardware refers to physical computer parts.", options: ["True", "False"], correctAnswer: "True", explanation: "Hardware is tangible equipment.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is software?", options: ["Keyboard", "Monitor", "Web browser", "CPU fan"], correctAnswer: "Web browser", explanation: "Programs are software.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "The CPU is often called the brain of the computer.", options: ["True", "False"], correctAnswer: "True", explanation: "It processes instructions.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is hardware?", options: ["Operating system", "Spreadsheet file", "RAM", "Antivirus definitions"], correctAnswer: "RAM", explanation: "RAM is a physical memory component.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Software gives instructions to hardware.", options: ["True", "False"], correctAnswer: "True", explanation: "Programs direct hardware operations.", questionType: "true_false", difficulty: "easy" },
    ],
    "lesson-cs-data": [
      { questionText: "Binary uses which digits?", options: ["0 and 1", "1 and 2", "0–9 only", "A–Z only"], correctAnswer: "0 and 1", explanation: "Binary is base-2.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "A bit is one binary digit.", options: ["True", "False"], correctAnswer: "True", explanation: "Bit = binary digit.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A byte is typically how many bits?", options: ["2", "4", "8", "16"], correctAnswer: "8", explanation: "Commonly 8 bits = 1 byte.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Binary suits electronics because circuits can represent two states.", options: ["True", "False"], correctAnswer: "True", explanation: "On/off maps well to 1/0.", questionType: "true_false", difficulty: "medium" },
      { questionText: "Computers store data only as decimal numbers internally.", options: ["True", "False"], correctAnswer: "False", explanation: "Internal representation is binary.", questionType: "true_false", difficulty: "easy" },
    ],
    "lesson-cs-algo-intro": [
      { questionText: "An algorithm is a step-by-step procedure to solve a problem.", options: ["True", "False"], correctAnswer: "True", explanation: "Algorithms define ordered steps.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Good algorithms should be:", options: ["Vague and endless", "Precise and finite", "Random only", "Unrelated to inputs"], correctAnswer: "Precise and finite", explanation: "They must end and be clear.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "A recipe can be thought of as an everyday algorithm.", options: ["True", "False"], correctAnswer: "True", explanation: "Recipes are ordered steps to a result.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Algorithms are only used in cooking, not computing.", options: ["True", "False"], correctAnswer: "False", explanation: "Computing relies heavily on algorithms.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which is closest to an algorithm?", options: ["A random doodle", "Clear steps to sort a list", "A single emoji", "An unplugged cable"], correctAnswer: "Clear steps to sort a list", explanation: "Sorting procedures are classic algorithms.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-cs-flowcharts": [
      { questionText: "Flowcharts show process flow visually.", options: ["True", "False"], correctAnswer: "True", explanation: "Shapes represent steps and decisions.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Pseudocode is:", options: ["Machine code only", "Structured plain-language algorithm description", "A type of hardware", "A network cable"], correctAnswer: "Structured plain-language algorithm description", explanation: "It bridges planning and coding.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "Decision steps in flowcharts often use diamond shapes.", options: ["True", "False"], correctAnswer: "True", explanation: "Diamonds commonly represent decisions.", questionType: "true_false", difficulty: "medium" },
      { questionText: "You should write pseudocode only after shipping production code.", options: ["True", "False"], correctAnswer: "False", explanation: "Pseudocode is useful before coding.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A benefit of flowcharts is:", options: ["Hiding logic", "Making sequence and decisions clearer", "Removing all planning", "Deleting requirements"], correctAnswer: "Making sequence and decisions clearer", explanation: "Visual flow aids understanding.", questionType: "multiple_choice", difficulty: "easy" },
    ],
    "lesson-cs-internet": [
      { questionText: "The internet is a global network of networks.", options: ["True", "False"], correctAnswer: "True", explanation: "It interconnects many networks worldwide.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Data on networks often travels in:", options: ["Packets", "Only paper letters", "Single infinite streams only", "USB sticks exclusively"], correctAnswer: "Packets", explanation: "Packet switching is fundamental online.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "IP addresses help route data to devices.", options: ["True", "False"], correctAnswer: "True", explanation: "Addresses identify destinations on networks.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A network connects devices to share data.", options: ["True", "False"], correctAnswer: "True", explanation: "Sharing resources/data is a core purpose.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Which best describes an IP address role?", options: ["Decorate websites", "Help deliver packets to the right place", "Replace passwords always", "Cool the CPU"], correctAnswer: "Help deliver packets to the right place", explanation: "Routing depends on addressing.", questionType: "multiple_choice", difficulty: "medium" },
    ],
    "lesson-cs-safety": [
      { questionText: "Phishing tries to trick you into revealing sensitive information.", options: ["True", "False"], correctAnswer: "True", explanation: "Fake messages impersonate trusted sources.", questionType: "true_false", difficulty: "easy" },
      { questionText: "A strong password should be:", options: ["Your name only", "Long and unique", "123456", "Shared with friends"], correctAnswer: "Long and unique", explanation: "Unique strong passwords reduce account risk.", questionType: "multiple_choice", difficulty: "easy" },
      { questionText: "You should share one-time codes if someone asks politely.", options: ["True", "False"], correctAnswer: "False", explanation: "Never share OTPs or passwords.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Keeping software updated helps security.", options: ["True", "False"], correctAnswer: "True", explanation: "Updates patch known vulnerabilities.", questionType: "true_false", difficulty: "easy" },
      { questionText: "Best response to a suspicious link:", options: ["Click immediately", "Pause and verify the source", "Forward to everyone", "Enter your password there"], correctAnswer: "Pause and verify the source", explanation: "Think before you click.", questionType: "multiple_choice", difficulty: "easy" },
    ],
  };

  const chosen = flavor[lesson.id] || QUESTION_BANK[lesson.id] || templates;
  return chosen.map((item, index) =>
    q(
      `q-${lesson.id}-${index + 1}`,
      lesson.id,
      lesson.topicId,
      item.questionText,
      item.options,
      item.correctAnswer,
      item.explanation,
      item.questionType,
      item.difficulty
    )
  );
}

export const QUESTIONS: Question[] = LESSONS.flatMap((lesson) => {
  if (QUESTION_BANK[lesson.id]) {
    return QUESTION_BANK[lesson.id].map((item, index) =>
      q(
        `q-${lesson.id}-${index + 1}`,
        lesson.id,
        lesson.topicId,
        item.questionText,
        item.options,
        item.correctAnswer,
        item.explanation,
        item.questionType,
        item.difficulty
      )
    );
  }
  return defaultQuestionsForLesson(lesson);
});

export const ACHIEVEMENTS: Achievement[] = [
  { id: "ach-first-step", name: "First Step", description: "Complete your first lesson.", icon: "🌱", requirementType: "lessons_completed", requirementValue: 1 },
  { id: "ach-quiz-starter", name: "Quiz Starter", description: "Complete your first quiz.", icon: "📝", requirementType: "quizzes_completed", requirementValue: 1 },
  { id: "ach-3-day", name: "3-Day Warrior", description: "Study for 3 consecutive days.", icon: "🔥", requirementType: "streak_days", requirementValue: 3 },
  { id: "ach-7-day", name: "7-Day Warrior", description: "Study for 7 consecutive days.", icon: "🏆", requirementType: "streak_days", requirementValue: 7 },
  { id: "ach-bookworm", name: "Bookworm", description: "Complete 10 lessons.", icon: "📚", requirementType: "lessons_completed", requirementValue: 10 },
  { id: "ach-brain", name: "Brain Builder", description: "Answer 100 questions.", icon: "🧠", requirementType: "questions_answered", requirementValue: 100 },
  { id: "ach-perfect", name: "Perfect Score", description: "Get 100% on a quiz.", icon: "💯", requirementType: "perfect_score", requirementValue: 1 },
  { id: "ach-scholar", name: "Scholar", description: "Reach Level 5.", icon: "🎓", requirementType: "level_reached", requirementValue: 5 },
  { id: "ach-first-battle", name: "First Battle", description: "Complete your first live battle.", icon: "⚔️", requirementType: "battles_completed", requirementValue: 1 },
  { id: "ach-battle-winner", name: "Battle Winner", description: "Win your first battle.", icon: "🏅", requirementType: "battles_won", requirementValue: 1 },
  { id: "ach-battle-warrior", name: "Battle Warrior", description: "Win 5 battles.", icon: "🛡️", requirementType: "battles_won", requirementValue: 5 },
  { id: "ach-battle-master", name: "Battle Master", description: "Win 25 battles.", icon: "👑", requirementType: "battles_won", requirementValue: 25 },
  { id: "ach-unbeatable", name: "Unbeatable", description: "Win 5 battles consecutively.", icon: "⚡", requirementType: "battle_win_streak", requirementValue: 5 },
  { id: "ach-perfect-battle", name: "Perfect Battle", description: "Answer every question correctly in a battle.", icon: "💎", requirementType: "perfect_battle", requirementValue: 1 },
];

export const DEMO_LEADERBOARD_USERS = [
  { id: "demo-sarah", fullName: "Sarah Johnson", xpThisWeek: 2450, level: 8 },
  { id: "demo-david", fullName: "David Okonkwo", xpThisWeek: 2310, level: 7 },
  { id: "demo-michael", fullName: "Michael Adeyemi", xpThisWeek: 2080, level: 7 },
  { id: "demo-grace", fullName: "Grace Nwosu", xpThisWeek: 1870, level: 6 },
  { id: "demo-tunde", fullName: "Tunde Balogun", xpThisWeek: 1760, level: 6 },
  { id: "demo-amina", fullName: "Amina Yusuf", xpThisWeek: 1690, level: 5 },
  { id: "demo-chidi", fullName: "Chidi Eze", xpThisWeek: 1580, level: 5 },
  { id: "demo-fatima", fullName: "Fatima Bello", xpThisWeek: 1490, level: 5 },
  { id: "demo-james", fullName: "James Okafor", xpThisWeek: 1320, level: 4 },
  { id: "demo-ngozi", fullName: "Ngozi Ike", xpThisWeek: 1210, level: 4 },
  { id: "demo-ibrahim", fullName: "Ibrahim Musa", xpThisWeek: 1100, level: 4 },
  { id: "demo-blessing", fullName: "Blessing Uche", xpThisWeek: 980, level: 3 },
  { id: "demo-kevin", fullName: "Kevin Mensah", xpThisWeek: 910, level: 3 },
  { id: "demo-ruth", fullName: "Ruth Addo", xpThisWeek: 860, level: 3 },
  { id: "demo-samuel", fullName: "Samuel Boateng", xpThisWeek: 805, level: 3 },
];

export function getAllSeedData() {
  return {
    subjects: SUBJECTS,
    topics: TOPICS,
    lessons: LESSONS,
    questions: QUESTIONS,
    achievements: ACHIEVEMENTS,
  };
}
