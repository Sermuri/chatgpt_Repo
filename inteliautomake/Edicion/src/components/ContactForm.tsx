import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ContactFormProps {
  onClose: () => void;
}

export function ContactForm({ onClose }: ContactFormProps) {
  const [showThankYou, setShowThankYou] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [userCaptchaInput, setUserCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateCaptcha();
    nameInputRef.current?.focus();
  }, []);

  const generateCaptcha = () => {
    const randomNum = Math.floor(Math.random() * 9000 + 1000);
    setCaptchaValue(randomNum.toString());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (userCaptchaInput !== captchaValue) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message')
    };

    try {
      const response = await fetch('https://hook.us2.make.com/uc9ewbmuv5337dmvytm9p81o9rz5ajd2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setShowThankYou(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (showThankYou) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg p-8 rounded-2xl text-center">
          <p className="text-xl">Gracias por contactar, en breve estaré en contacto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 overflow-y-auto py-8">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg p-8 rounded-2xl max-w-2xl w-full mx-auto my-auto animate-slideDown">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Contacto</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre Completo</label>
            <input 
              ref={nameInputRef}
              name="name"
              type="text" 
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              name="email"
              type="email" 
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Celular / Whatsapp</label>
            <input 
              name="phone"
              type="tel" 
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cuentame que tienes en mente:</label>
            <textarea 
              name="message"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              required
            ></textarea>
          </div>

          {/* CAPTCHA */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Verificación de Seguridad</label>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 px-4 py-2 rounded-lg font-mono text-lg tracking-wider">
                {captchaValue}
              </div>
              <input
                type="text"
                placeholder="Ingresa el código"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={userCaptchaInput}
                onChange={(e) => {
                  setCaptchaError(false);
                  setUserCaptchaInput(e.target.value);
                }}
                required
              />
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                ↻
              </button>
            </div>
            {captchaError && (
              <p className="text-red-500 text-sm">Código incorrecto. Por favor, intenta nuevamente.</p>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Enviar Mensaje
          </button>

          {/* Privacy Notice */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg text-sm text-gray-300">
            <h3 className="font-semibold text-white mb-2">Privacidad y Confidencialidad</h3>
            <p className="leading-relaxed">
              La información proporcionada en este formulario es estrictamente confidencial y no será compartida con terceros bajo ninguna circunstancia. Su único propósito es permitirnos ponernos en contacto con usted y ofrecerle soluciones adaptadas a sus necesidades. Valoramos su privacidad y nos comprometemos a proteger sus datos de acuerdo con las normativas vigentes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}