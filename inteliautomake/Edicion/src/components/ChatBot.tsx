import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { services } from '../data/services';

interface Message {
  type: 'user' | 'bot';
  content: string;
  isTyping?: boolean;
}

interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  interests?: string[];
  problems?: string[];
  questions?: string[];
  stage: 'initial' | 'name' | 'understanding' | 'email' | 'phone' | 'analysis' | 'closing';
}

export function ChatBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfo>({ stage: 'initial' });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    addBotResponse('¡Hola! Soy Sergio, tu consultor especializado en soluciones tecnológicas inteligentes. Me gustaría conocerte mejor para entender cómo puedo ayudarte. ¿Podrías decirme tu nombre?');
  }, []);

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('chatHistory', JSON.stringify(messages.filter(m => !m.isTyping)));
  }, [messages]);

  const simulateTyping = async (text: string) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { type: 'bot', content: '', isTyping: true }]);
    
    let displayText = '';
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      displayText += (i > 0 ? ' ' : '') + words[i];
      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'bot', content: displayText, isTyping: true }
      ]);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setMessages(prev => [
      ...prev.slice(0, -1),
      { type: 'bot', content: text, isTyping: false }
    ]);
    setIsTyping(false);
  };

  const addBotResponse = (response: string) => {
    simulateTyping(response);
  };

  const isValidName = (text: string): boolean => {
    // Check if the text contains at least two characters and doesn't contain numbers
    return text.length >= 2 && !/\d/.test(text);
  };

  const identifyInterests = (message: string): string[] => {
    const interests: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    services.forEach(service => {
      const keywords = [
        ...service.title.toLowerCase().split(' '),
        ...service.description.toLowerCase().split(' ')
      ];
      
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        interests.push(service.title);
      }
    });

    return interests;
  };

  const identifyProblems = (message: string): string[] => {
    const problems: string[] = [];
    const problemIndicators = [
      'necesito', 'problema', 'difícil', 'complicado', 'mejorar',
      'optimizar', 'automatizar', 'tiempo', 'costoso', 'manual',
      'lento', 'error', 'falla', 'pérdida', 'ineficiente'
    ];

    const lowerMessage = message.toLowerCase();
    problemIndicators.forEach(indicator => {
      if (lowerMessage.includes(indicator)) {
        const sentenceWithProblem = message.split('.').find(s => 
          s.toLowerCase().includes(indicator)
        );
        if (sentenceWithProblem) {
          problems.push(sentenceWithProblem.trim());
        }
      }
    });

    return problems;
  };

  const identifyQuestions = (message: string): string[] => {
    const questions: string[] = [];
    if (message.includes('?')) {
      const questionSentences = message.split(/[.!?]/).filter(s => s.includes('?'));
      questions.push(...questionSentences.map(q => q.trim()));
    }
    return questions;
  };

  const generateServicesSummary = (): string => {
    return `Ofrecemos varios servicios que podrían ayudarte:

1. Automatización de procesos para ahorro de tiempo y dinero
2. Asistentes virtuales 24/7
3. Capacitación en tecnologías avanzadas
4. Clonación de voces y creación de música
5. Contenido visual para marketing
6. Asistentes de voz personalizados
7. Gestión automatizada de redes sociales
8. Soluciones tecnológicas a medida

¿Te gustaría saber más sobre alguno en particular?`;
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Update interests, problems, and questions
    const newInterests = identifyInterests(userMessage);
    const newProblems = identifyProblems(userMessage);
    const newQuestions = identifyQuestions(userMessage);
    
    if (newInterests.length > 0) {
      setUserInfo(prev => ({
        ...prev,
        interests: [...(prev.interests || []), ...newInterests]
      }));
    }
    
    if (newProblems.length > 0) {
      setUserInfo(prev => ({
        ...prev,
        problems: [...(prev.problems || []), ...newProblems]
      }));
    }

    if (newQuestions.length > 0) {
      setUserInfo(prev => ({
        ...prev,
        questions: [...(prev.questions || []), ...newQuestions]
      }));
    }

    // Check for service-related questions
    if (lowerMessage.includes('servicio') || lowerMessage.includes('ofrece')) {
      return generateServicesSummary();
    }

    // Stage-based responses
    switch (userInfo.stage) {
      case 'initial':
        if (!isValidName(userMessage)) {
          return 'Por favor, comparte tu nombre real para poder ayudarte mejor.';
        }
        setUserInfo(prev => ({ ...prev, name: userMessage, stage: 'understanding' }));
        return `¡Gracias ${userMessage}! Me alegro de conocerte. Me gustaría entender mejor tu situación actual. ¿Podrías contarme qué desafíos específicos estás enfrentando en tu negocio o qué tipo de mejoras te gustaría implementar? También puedes preguntarme sobre nuestros servicios si lo prefieres.`;

      case 'understanding':
        if (newQuestions.length > 0) {
          // If the user has questions, answer them before moving to email stage
          const relevantService = services.find(service => 
            newQuestions.some(q => q.toLowerCase().includes(service.title.toLowerCase()))
          );
          
          if (relevantService) {
            return `${relevantService.fullDescription}\n\n¿Te gustaría saber más sobre esto o prefieres que te cuente sobre otros servicios?`;
          }
        }
        
        setUserInfo(prev => ({ ...prev, stage: 'email' }));
        return `Entiendo perfectamente tu situación${userInfo.name ? ', ' + userInfo.name : ''}. Basado en lo que me cuentas, veo varias oportunidades para optimizar y mejorar estos procesos. Me gustaría enviarte un análisis detallado con algunas sugerencias específicas para tu caso. ¿Podrías compartirme tu email?`;

      case 'email':
        if (!userMessage.includes('@')) {
          return 'Por favor, proporciona una dirección de email válida para poder enviarte el análisis.';
        }
        setUserInfo(prev => ({ ...prev, email: userMessage, stage: 'phone' }));
        return `Excelente${userInfo.name ? ', ' + userInfo.name : ''}. Para poder discutir las soluciones más adecuadas para ti, ¿me proporcionarías tu número de WhatsApp? Así podré contactarte y profundizar en los detalles de manera más personalizada.`;

      case 'phone':
        setUserInfo(prev => ({ ...prev, phone: userMessage, stage: 'analysis' }));
        
        // Prepare detailed summary for webhook
        const summaryText = `
Cliente: ${userInfo.name}
Intereses identificados: ${userInfo.interests?.join(', ')}
Problemas identificados: ${userInfo.problems?.join(', ')}
Preguntas realizadas: ${userInfo.questions?.join(', ')}
Requiere análisis y propuesta de solución personalizada.`;
        
        fetch('https://hook.us2.make.com/uc9ewbmuv5337dmvytm9p81o9rz5ajd2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: userInfo.name,
            email: userInfo.email,
            phone: userMessage,
            message: summaryText
          })
        });

        setUserInfo(prev => ({ ...prev, stage: 'closing' }));
        return `Perfecto ${userInfo.name}, he tomado nota detallada de tus necesidades y prepararé un análisis personalizado con soluciones específicas para tu caso. Te contactaré pronto para discutir las mejores opciones para optimizar tus procesos y alcanzar tus objetivos. ¿Tienes alguna pregunta adicional mientras tanto?`;

      case 'closing':
        if (newQuestions.length > 0) {
          return `Excelente pregunta. ${generateServicesSummary()}\n\nEstaré en contacto contigo pronto con propuestas más específicas para tu situación.`;
        }
        return `Gracias por tu tiempo, ${userInfo.name}. Estaré en contacto contigo pronto con propuestas específicas para tu situación. Si tienes más preguntas en cualquier momento, no dudes en consultarme.`;

      default:
        return 'Entiendo. ¿Hay algo específico sobre lo que te gustaría profundizar?';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateResponse(userMessage);
      addBotResponse(botResponse);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="font-semibold">Consultor Virtual</h3>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.type === 'user' 
                ? 'ml-auto bg-blue-500' 
                : 'mr-auto bg-gray-700'
            } max-w-[80%] rounded-lg p-3`}
          >
            {message.content}
            {message.isTyping && <span className="inline-block ml-1">|</span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={isTyping}
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}