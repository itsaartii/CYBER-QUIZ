import axios from 'axios';

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';
const OLLAMA_TAGS_ENDPOINT = 'http://localhost:11434/api/tags';
const TIMEOUT = 300000; // 5 minutes for CPU mode

// Function to get available models
const getAvailableModels = async () => {
  try {
    const response = await axios.get(OLLAMA_TAGS_ENDPOINT);
    if (response.data && response.data.models) {
      return response.data.models.map(model => ({
        name: model.name,
        displayName: model.name.split(':')[0].replace(/-/g, ' '),
        size: model.size,
        details: model.details
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching models:', error);
    throw new Error('Failed to fetch available AI models');
  }
};

const generateMCQuestion = async (topic) => {
  const MODEL_NAME = 'qwen2:1.5b';
  const axiosInstance = axios.create({
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  try {
    // First verify if the server is accessible and model exists
    try {
      const models = await getAvailableModels();
      if (!models.some(model => model.name === MODEL_NAME)) {
        throw new Error('Qwen2 model is not available. Please make sure it is installed.');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama server is not running. Please start the server and try again.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection to Ollama server timed out. Please check if the server is responsive.');
      }
      throw error;
    }

    // Determine if topic matches a scenario type
    const scenarioTypes = ['email', 'network_setup', 'password_analysis', 'web_request', 'popup', 'message'];
    const normalizedTopic = topic.toLowerCase().replace(/[^a-z]/g, '_');
    const matchingScenarioType = scenarioTypes.find(type => 
      normalizedTopic.includes(type.replace('_', '')) || 
      type.replace('_', '').includes(normalizedTopic)
    );

    // Configuration for Qwen2 model
    const config = {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 300,
      questionPrompt: `Create a unique cybersecurity question about ${topic}.

${matchingScenarioType ? `
Your response must follow this format:
QUESTION: (Write your unique question here)
SCENARIO_TYPE: ${matchingScenarioType}
SCENARIO: (Write a detailed scenario)
RED_FLAGS: (List at least 3 security issues or warning signs, separated by commas)
` : `
Your response must follow this format:
QUESTION: (Write your unique question here)
`}

Guidelines:
1. Make the question specifically about ${topic}
2. ${matchingScenarioType 
    ? `Create a realistic scenario that demonstrates a ${topic} situation`
    : 'Create a clear, focused question about ' + topic}
3. Include modern security concepts and best practices
4. Focus on practical, real-world situations
5. Avoid generic or obvious scenarios

Generate a new question now:`
    };

    // Step 1: Generate the question and scenario
    const questionResponse = await axiosInstance.post(OLLAMA_ENDPOINT, {
      model: MODEL_NAME,
      prompt: config.questionPrompt,
      stream: false,
      options: {
        temperature: config.temperature,
        top_p: config.top_p,
        num_predict: config.num_predict,
        stop: ["\n\n", "Example", "Guidelines:", "Generate"]
      }
    });

    if (!questionResponse.data?.response) {
      throw new Error('Invalid response for question generation');
    }

    // Parse the question response
    const parseQuestionComponents = (response) => {
      const components = {
        questionText: null,
        scenarioType: null,
        scenarioContent: null,
        redFlagsText: null
      };

      // Log the response for debugging
      console.log('Raw response:', response);

      // More robust parsing with multiple regex patterns
      const patterns = {
        question: [/QUESTION:\s*(.*?)(?=\n|$)/is],
        scenarioType: [/SCENARIO_TYPE:\s*(.*?)(?=\n|$)/is],
        scenario: [/SCENARIO:\s*(.*?)(?=\n|$)/is],
        redFlags: [/RED_FLAGS:\s*(.*?)(?=\n|$)/is]
      };

      // Always try to get the question
      const questionMatch = response.match(patterns.question[0]);
      if (!questionMatch || !questionMatch[1]?.trim()) {
        throw new Error('Question text is missing or empty');
      }
      components.questionText = questionMatch[1].trim();

      // Only look for scenario components if we have a matching scenario type
      if (matchingScenarioType) {
        const scenarioMatch = response.match(patterns.scenario[0]);
        const typeMatch = response.match(patterns.scenarioType[0]);
        const redFlagsMatch = response.match(patterns.redFlags[0]);

        if (!typeMatch || !scenarioMatch || !redFlagsMatch) {
          throw new Error('Scenario components are missing. Retrying with a simple question format.');
        }

        components.scenarioType = typeMatch[1].trim();
        components.scenarioContent = scenarioMatch[1].trim();
        components.redFlagsText = redFlagsMatch[1].trim();
      }

      return components;
    };

    const { questionText, scenarioType, scenarioContent, redFlagsText } = parseQuestionComponents(questionResponse.data.response);

    // Step 2: Generate options
    const optionsPrompt = `For this cybersecurity question about ${topic}: "${questionText}"

Generate 4 distinct options and mark exactly one correct answer with [CORRECT].
Make the options specific to ${topic}.

Guidelines:
1. The correct answer should be comprehensive and address the specific security concerns
2. Incorrect options should be plausible but flawed approaches
3. Each option should be unique and directly relevant
4. Avoid generic or obvious wrong answers

Format each option like this:
1. [CORRECT] (Best practice or correct solution)
2. (Common but incorrect approach)
3. (Plausible but insecure option)
4. (Fundamentally flawed approach)

Generate your 4 options now:`;

    const optionsResponse = await axiosInstance.post(OLLAMA_ENDPOINT, {
      model: MODEL_NAME,
      prompt: optionsPrompt,
      stream: false,
      options: {
        temperature: 0.6,  // Slightly lower for more focused options
        top_p: 0.8,       // High enough for variety
        num_predict: 200,  // Reduced for faster response
        stop: ["\n\n", "5.", "Guidelines:", "Format", "Generate"]
      }
    });

    if (!optionsResponse.data?.response) {
      throw new Error('Invalid response for options generation');
    }

    // Parse options
    const optionsText = optionsResponse.data.response.trim();
    console.log('Raw options response:', optionsText);

    const optionsLines = optionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\.\s/.test(line));

    if (optionsLines.length !== 4) {
      throw new Error(`Invalid number of options generated (got ${optionsLines.length}, expected 4)`);
    }

    const options = [];
    let correctAnswer = -1;
    const correctPattern = /\[CORRECT\]/i;

    optionsLines.forEach((line, index) => {
      let optionText = line
        .replace(/^\d+\.\s*/, '')
        .replace(correctPattern, '')
        .trim();

      options.push(optionText);
      
      if (correctPattern.test(line)) {
        if (correctAnswer !== -1) {
          throw new Error('Multiple correct answers marked');
        }
        correctAnswer = index;
      }
    });

    if (correctAnswer === -1) {
      throw new Error('No correct answer marked in options');
    }

    // Step 3: Generate explanation
    const explanationPrompt = `Explain why this is the correct answer for the cybersecurity question about ${topic}:
Question: "${questionText}"
Correct Answer: "${options[correctAnswer]}"

Provide:
1. Why the correct answer is the best solution
2. Specific security benefits of this approach
3. Why each incorrect option is problematic
4. Real-world implications of choosing wrong options

Keep the explanation clear and practical.`;

    const explanationResponse = await axiosInstance.post(OLLAMA_ENDPOINT, {
      model: MODEL_NAME,
      prompt: explanationPrompt,
      stream: false,
      options: {
        temperature: 0.5,  // Lower for more focused explanation
        top_p: 0.7,       // Balanced for clarity and creativity
        num_predict: 250   // Reduced for faster response
      }
    });

    if (!explanationResponse.data?.response) {
      throw new Error('Invalid response for explanation generation');
    }

    // Construct the final question object
    const questionData = {
      id: `ai_${Date.now()}`,
      type: matchingScenarioType ? 'scenario' : 'regular',
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanationResponse.data.response.trim(),
      ...(matchingScenarioType && {
        scenario: {
          type: scenarioType?.toLowerCase(),
          content: scenarioContent,
          redFlags: redFlagsText?.split(',').map(flag => flag.trim())
        }
      }),
      points: 10,
      difficulty: 'beginner',
      timestamp: Date.now()
    };

    // Validate the question data
    const validationErrors = [];
    
    if (!questionData.question?.trim()) {
      validationErrors.push('Question text is missing or empty');
    }
    
    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
      validationErrors.push('Options must be an array with exactly 4 items');
    } else if (questionData.options.some(opt => !opt?.trim())) {
      validationErrors.push('All options must be non-empty strings');
    }
    
    if (typeof questionData.correctAnswer !== 'number' || 
        questionData.correctAnswer < 0 || 
        questionData.correctAnswer > 3) {
      validationErrors.push('correctAnswer must be a number between 0 and 3');
    }
    
    if (!questionData.explanation?.trim()) {
      validationErrors.push('Explanation is missing or empty');
    }

    // Only validate scenario components if it's a scenario-type question
    if (questionData.type === 'scenario') {
      if (!questionData.scenario?.type || 
          !['email', 'network_setup', 'password_analysis', 'web_request', 'popup', 'message']
            .includes(questionData.scenario.type)) {
        validationErrors.push('Invalid or missing scenario type');
      }
      
      if (!questionData.scenario?.content?.trim()) {
        validationErrors.push('Scenario content is missing or empty');
      }
      
      if (!Array.isArray(questionData.scenario?.redFlags) || 
          questionData.scenario.redFlags.length === 0) {
        validationErrors.push('Red flags must be a non-empty array');
      }
    }

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      throw new Error('Invalid question format: ' + validationErrors.join(', '));
    }

    return questionData;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error(error.message || 'Failed to generate question');
  }
};

const generatePreQuizNotes = async (questions, difficulty) => {
  const MODEL_NAME = 'qwen2:1.5b';
  const axiosInstance = axios.create({
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // First verify if the server is accessible and model exists
  try {
    const models = await getAvailableModels();
    if (!models.some(model => model.name === MODEL_NAME)) {
      throw new Error('Qwen2 model is not available. Please make sure it is installed.');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama server is not running. Please start the server and try again.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Connection to Ollama server timed out. Please check if the server is responsive.');
    }
    throw error;
  }

  // Define fallback notes at the beginning
  const fallbackNotes = {
    beginner: [
      {
        point: 'Use strong passwords.',
        theory: 'Strong passwords are your first line of defense against unauthorized access.',
        practical: 'Create passwords with at least 12 characters, mixing letters, numbers, and symbols.'
      },
      {
        point: 'Recognize phishing attempts.',
        theory: 'Phishing attacks trick users into revealing sensitive information.',
        practical: 'Verify sender addresses and never click suspicious links.'
      },
      {
        point: 'Keep systems updated.',
        theory: 'Updates patch security vulnerabilities in software.',
        practical: 'Enable automatic updates and install security patches promptly.'
      },
      {
        point: 'Secure your connections.',
        theory: 'Public networks can expose your data to attackers.',
        practical: 'Use VPNs and avoid sensitive transactions on public Wi-Fi.'
      },
      {
        point: 'Practice safe browsing.',
        theory: 'Malicious websites can compromise your security.',
        practical: 'Look for HTTPS and be cautious with downloads.'
      }
    ],
    intermediate: [
      {
        point: 'Implement MFA.',
        theory: 'Multiple factors provide stronger authentication than passwords alone.',
        practical: 'Use biometrics, security keys, or authenticator apps as second factors.'
      },
      {
        point: 'Segment networks.',
        theory: 'Segmentation contains breaches and limits lateral movement.',
        practical: 'Separate critical systems and use firewalls between segments.'
      },
      {
        point: 'Secure data handling.',
        theory: 'Different data types require different protection levels.',
        practical: 'Classify data and apply appropriate encryption and access controls.'
      },
      {
        point: 'Protect endpoints.',
        theory: 'Endpoints are common targets for cyber attacks.',
        practical: 'Deploy antivirus, firewalls, and encryption on all devices.'
      },
      {
        point: 'Monitor security.',
        theory: 'Early detection prevents major security incidents.',
        practical: 'Implement logging and security monitoring systems.'
      }
    ],
    advanced: [
      {
        point: 'Zero trust security.',
        theory: 'Trust nothing and verify everything, regardless of location.',
        practical: 'Implement continuous verification and micro-segmentation.'
      },
      {
        point: 'Threat modeling.',
        theory: 'Systematic approach to identifying and addressing security risks.',
        practical: 'Use STRIDE/PASTA frameworks and analyze attack vectors.'
      },
      {
        point: 'Security automation.',
        theory: 'Automation reduces human error and improves response time.',
        practical: 'Automate scanning, patching, and incident response.'
      },
      {
        point: 'Cryptography.',
        theory: 'Proper crypto implementation is crucial for security.',
        practical: 'Use standard libraries and implement perfect forward secrecy.'
      },
      {
        point: 'Secure development.',
        theory: 'Security must be integrated into the development lifecycle.',
        practical: 'Implement code signing and security testing in CI/CD.'
      }
    ]
  };

  try {
    // Analyze questions to extract key information
    const analysis = questions.reduce((acc, q) => {
      // Extract main topics and concepts
      const words = q.question.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && !acc.commonWords.has(word)) {
          acc.topics.add(word);
        }
      });

      // Track scenario types and their frequency
      if (q.scenario?.type) {
        acc.scenarios[q.scenario.type] = (acc.scenarios[q.scenario.type] || 0) + 1;
      }

      // Extract key concepts from options and explanations
      [...q.options, q.explanation].forEach(text => {
        const concepts = text.toLowerCase()
          .split(/\s+/)
          .filter(word => word.length > 3 && !acc.commonWords.has(word));
        concepts.forEach(concept => acc.concepts.add(concept));
      });

      // Track correct answers and their patterns
      const correctOption = q.options[q.correctAnswer];
      acc.correctPatterns.push({
        topic: words.slice(0, 3).join(' '),
        solution: correctOption
      });

      return acc;
    }, {
      topics: new Set(),
      concepts: new Set(),
      scenarios: {},
      correctPatterns: [],
      commonWords: new Set(['what', 'when', 'where', 'which', 'how', 'why', 'is', 'are', 'the', 'and', 'for', 'that', 'this'])
    });

    // Create a focused prompt based on the analysis
    const prompt = `As a cybersecurity expert, create 5 essential study notes for a ${difficulty} level quiz.

Quiz Analysis:
- Main Topics: ${Array.from(analysis.topics).slice(0, 8).join(', ')}
- Key Concepts: ${Array.from(analysis.concepts).slice(0, 8).join(', ')}
${Object.keys(analysis.scenarios).length > 0 ? 
  `- Scenario Types: ${Object.entries(analysis.scenarios)
    .map(([type, count]) => `${type} (${count} questions)`)
    .join(', ')}` : ''}

Common Correct Solutions:
${analysis.correctPatterns.slice(0, 3)
  .map(pattern => `- For ${pattern.topic}: ${pattern.solution}`)
  .join('\n')}

Create 5 study notes that:
1. Focus on the most frequent topics and concepts from the quiz
2. Match ${difficulty} level understanding
3. Provide practical examples similar to the quiz scenarios
4. Include specific security principles tested in the questions

${difficulty === 'beginner' ? 
  'Keep explanations simple and focus on fundamental security practices.' :
  difficulty === 'intermediate' ? 
  'Include specific tools and techniques, with real-world applications.' :
  'Cover advanced concepts and enterprise-level security practices.'}

Format each note as:
KEY POINT: (Clear, actionable security principle)
THEORY: (Detailed explanation with examples)
PRACTICAL: (Step-by-step implementation guide)

Generate 5 unique, quiz-relevant notes now:`;

    const response = await axiosInstance.post(OLLAMA_ENDPOINT, {
      model: MODEL_NAME,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.95,
        top_k: 40,
        num_predict: 1500
      }
    });

    if (!response.data?.response) {
      throw new Error('Invalid response from model');
    }

    // Parse and validate notes
    const notes = response.data.response
      .split(/KEY POINT:/g)
      .slice(1)
      .map(block => {
        const parts = block.split(/THEORY:|PRACTICAL:/);
        if (parts.length !== 3) return null;

        const point = parts[0]?.trim();
        const theory = parts[1]?.trim();
        const practical = parts[2]?.trim();

        // Validate content quality
        if (!point || !theory || !practical ||
            point.length < 10 || theory.length < 30 || practical.length < 30) {
          return null;
        }

        // Clean up and format the note
        return {
          point: point.endsWith('.') ? point : `${point}.`,
          theory: theory.endsWith('.') ? theory : `${theory}.`,
          practical: practical.endsWith('.') ? practical : `${practical}.`
        };
      })
      .filter(note => note !== null);

    // Ensure notes are unique and quiz-relevant
    const uniqueNotes = Array.from(new Set(notes.map(note => note.point)))
      .map(point => notes.find(note => note.point === point))
      .slice(0, 5);

    return uniqueNotes.length === 5 ? uniqueNotes : fallbackNotes[difficulty];

  } catch (error) {
    console.error('Note generation error:', error);
    return fallbackNotes[difficulty];
  }
};

export { generateMCQuestion, getAvailableModels, generatePreQuizNotes }; 