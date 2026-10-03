/**
 * OmniFlow AI - Genkit Server & Customer Service Flows
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSy_DEV_KEY_PLACEHOLDER';

// Inicializar Genkit con el plugin oficial de Google AI (Gemini)
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey
    })
  ],
});

// Flow 1: Asistente General de Atención al Cliente para E-commerce
export const customerSupportFlow = ai.defineFlow(
  {
    name: 'customerSupportFlow',
    inputSchema: z.object({
      customerName: z.string().optional().describe('Nombre del cliente si está identificado'),
      message: z.string().describe('Consulta o mensaje del cliente en WhatsApp'),
    }),
    outputSchema: z.object({
      response: z.string().describe('Respuesta generada para WhatsApp'),
      intentDetected: z.string().describe('Intención principal detectada'),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `Eres el agente virtual oficial de OmniFlow Store para WhatsApp Business.
Cliente: ${input.customerName || 'Cliente'}
Mensaje del cliente: "${input.message}"
Responde en español de forma concisa, cálida y profesional, usando negritas con asteriscos para WhatsApp (*texto*).`,
    });

    return {
      response: response.text,
      intentDetected: 'GENERAL_SUPPORT',
    };
  }
);

// Flow 2: Rastreo y Gestión de Envíos
export const orderTrackingFlow = ai.defineFlow(
  {
    name: 'orderTrackingFlow',
    inputSchema: z.object({
      orderId: z.string().describe('Número de orden o tracking (ej. AR-8492)'),
      customerInquiry: z.string().describe('Pregunta o reclamo del cliente'),
    }),
    outputSchema: z.object({
      statusMessage: z.string().describe('Detalle del estado del envío'),
      carrier: z.string().describe('Operador logístico asignado'),
    }),
  },
  async (input) => {
    const response = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `Eres el especialista logístico de OmniFlow Store.
El cliente consulta por la orden #${input.orderId}: "${input.customerInquiry}".
Explica que el pedido está en reparto de última milla con entrega estimada para el día de hoy, y añade recomendaciones amigables.`,
    });

    return {
      statusMessage: response.text,
      carrier: 'DHL Express',
    };
  }
);
