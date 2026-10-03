/**
 * OmniFlow AI - Conversational Engine & NLP Simulator
 * Motor de intención, análisis de sentimiento, ejecución de herramientas y RAG
 */

import { MOCK_DATABASE } from './mock-data.js';

export class BotEngine {
  constructor() {
    this.history = [];
    this.apiKey = localStorage.getItem('omniflow_custom_api_key') || null;
    this.provider = localStorage.getItem('omniflow_ai_provider') || 'gemini'; // 'gemini' | 'openai'
    this.currentContext = {
      detectedOrderId: null,
      sentimentScore: 75,
      sentimentLabel: 'neutral',
      ticketPriority: 'NORMAL',
      activeStep: 'IDLE'
    };
  }

  setApiKey(key, provider = 'gemini') {
    this.apiKey = key;
    this.provider = provider;
    if (key) {
      localStorage.setItem('omniflow_custom_api_key', key);
      localStorage.setItem('omniflow_ai_provider', provider);
    } else {
      localStorage.removeItem('omniflow_custom_api_key');
    }
  }

  hasCustomApiKey() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  /**
   * Procesa el mensaje del usuario y devuelve respuesta enriquecida con metadatos para el CRM
   */
  async processMessage(userText, onStepUpdate = null) {
    const startTime = performance.now();
    const cleanText = userText.trim();
    
    // 1. Extraer ID de pedido si existe (#AR-XXXX o AR-XXXX o números)
    const orderMatch = cleanText.match(/(?:#?)(AR-\d{4})/i) || cleanText.match(/\b(\d{4})\b/);
    let extractedOrderId = null;
    if (orderMatch) {
      extractedOrderId = orderMatch[1].toUpperCase();
      if (!extractedOrderId.startsWith('AR-')) {
        extractedOrderId = `AR-${extractedOrderId}`;
      }
      this.currentContext.detectedOrderId = extractedOrderId;
    }

    // 2. Análisis de sentimiento
    const sentiment = this._analyzeSentiment(cleanText);
    this.currentContext.sentimentLabel = sentiment.label;
    this.currentContext.sentimentScore = sentiment.score;

    // 3. Notificar paso de análisis preliminar
    if (onStepUpdate) {
      onStepUpdate({
        stage: 'INTENT_CLASSIFICATION',
        text: 'Analizando intención y sentimiento del cliente...'
      });
    }

    // Si el usuario configuró una API Key en vivo de Gemini / OpenAI, podemos usarla
    if (this.hasCustomApiKey()) {
      try {
        if (onStepUpdate) {
          onStepUpdate({
            stage: 'LLM_CALL',
            text: `Ejecutando inferencia en vivo vía ${this.provider.toUpperCase()} API...`
          });
        }
        const liveResponse = await this._callLiveLLM(cleanText, extractedOrderId);
        const duration = Math.round(performance.now() - startTime);
        return {
          ...liveResponse,
          executionTimeMs: duration,
          isLiveAI: true
        };
      } catch (err) {
        console.warn('Fallo en API en vivo, recurriendo al motor simulado:', err);
      }
    }

    // 4. Inferencia local determinista y ultrarrápida (Zero-cost, Zero-failure)
    await this._simulateLatency(450);

    const intentData = this._classifyIntent(cleanText, extractedOrderId);

    if (onStepUpdate) {
      onStepUpdate({
        stage: 'TOOL_EXECUTION',
        text: `Ejecutando herramienta: ${intentData.toolCalled || 'knowledge_retrieval'}`,
        tool: intentData.toolCalled
      });
    }

    await this._simulateLatency(350);

    const responsePayload = this._generateResponse(intentData, cleanText);
    const duration = Math.round(performance.now() - startTime);

    return {
      ...responsePayload,
      executionTimeMs: duration,
      sentiment: sentiment,
      intent: intentData.intent,
      confidence: intentData.confidence,
      toolCalled: intentData.toolCalled,
      toolPayload: intentData.toolPayload,
      isLiveAI: false
    };
  }

  /**
   * Clasifica la intención del usuario a partir de patrones semánticos
   */
  _classifyIntent(text, orderId) {
    const lower = text.toLowerCase();

    // Escalado humano explícito
    if (lower.includes('humano') || lower.includes('asesor') || lower.includes('persona') || lower.includes('operador') || lower.includes('representante')) {
      return {
        intent: 'HUMAN_ESCALATION',
        confidence: 0.99,
        toolCalled: 'escalate_to_human_agent',
        toolPayload: { reason: 'Solicitud directa del cliente', priority: 'HIGH' }
      };
    }

    // Reclamo por retraso o insatisfacción
    if (lower.includes('retras') || lower.includes('demora') || lower.includes('no llegó') || lower.includes('no llego') || lower.includes('tardanza') || lower.includes('disconforme') || lower.includes('enojad') || lower.includes('pesimo') || lower.includes('pésimo') || lower.includes('estafa')) {
      const order = MOCK_DATABASE.orders[orderId] || MOCK_DATABASE.orders['AR-9104'];
      return {
        intent: 'COMPLAINT_DELAY',
        confidence: 0.96,
        orderId: order.id,
        toolCalled: 'logistics_investigation_and_voucher',
        toolPayload: { orderId: order.id, customer: order.customer.name, delayReason: order.delayReason }
      };
    }

    // Devoluciones y cambios de producto
    if (lower.includes('cambi') || lower.includes('devolv') || lower.includes('devolución') || lower.includes('devolucion') || lower.includes('talle') || lower.includes('talla') || lower.includes('reembols')) {
      const targetId = orderId || this.currentContext.detectedOrderId || 'AR-7210';
      const order = MOCK_DATABASE.orders[targetId] || MOCK_DATABASE.orders['AR-7210'];
      return {
        intent: 'RETURN_EXCHANGE',
        confidence: 0.95,
        orderId: targetId,
        toolCalled: 'generate_return_portal_token',
        toolPayload: { orderId: targetId, item: order.item, returnEligible: true }
      };
    }

    // Tracking y estado de pedido
    if (orderId || lower.includes('pedido') || lower.includes('dónde viene') || lower.includes('donde viene') || lower.includes('donde esta') || lower.includes('dónde está') || lower.includes('tracking') || lower.includes('seguimiento') || lower.includes('envío') || lower.includes('envio') || lower.includes('paquete')) {
      const targetId = orderId || this.currentContext.detectedOrderId || 'AR-8492';
      const order = MOCK_DATABASE.orders[targetId] || MOCK_DATABASE.orders['AR-8492'];
      return {
        intent: 'ORDER_TRACKING',
        confidence: 0.98,
        orderId: targetId,
        toolCalled: 'dhl_courier_tracking_api',
        toolPayload: { orderId: targetId, carrier: order.carrier, trackingNumber: order.trackingNumber }
      };
    }

    // Consulta de stock y productos
    if (lower.includes('stock') || lower.includes('tienen') || lower.includes('zapatillas') || lower.includes('chaqueta') || lower.includes('auriculares') || lower.includes('precio') || lower.includes('comprar') || lower.includes('recomiend')) {
      return {
        intent: 'PRODUCT_STOCK_QUERY',
        confidence: 0.93,
        toolCalled: 'shopify_inventory_search',
        toolPayload: { query: 'running shoes size 42', inStock: true }
      };
    }

    // Políticas generales de envío o pagos
    if (lower.includes('cuanto tarda') || lower.includes('cuánto tarda') || lower.includes('costo de envio') || lower.includes('costo de envío') || lower.includes('formas de pago') || lower.includes('tarjeta') || lower.includes('cuotas')) {
      return {
        intent: 'POLICY_INQUIRY',
        confidence: 0.91,
        toolCalled: 'knowledge_base_rag_retrieval',
        toolPayload: { section: 'shipping_and_payment_faq' }
      };
    }

    // Saludo de apertura
    if (lower.includes('hola') || lower.includes('buen dia') || lower.includes('buen día') || lower.includes('buenas tardes') || lower.includes('buenas')) {
      return {
        intent: 'GREETING',
        confidence: 0.99,
        toolCalled: 'crm_welcome_menu',
        toolPayload: { activeUser: true }
      };
    }

    // Fallback general
    return {
      intent: 'GENERAL_ASSISTANCE',
      confidence: 0.85,
      toolCalled: 'knowledge_base_rag_retrieval',
      toolPayload: { query: text }
    };
  }

  /**
   * Analizador de sentimiento y frustración
   */
  _analyzeSentiment(text) {
    const lower = text.toLowerCase();
    const negativeKeywords = ['enojad', 'pésimo', 'pesimo', 'estafa', 'vergüenza', 'incompetent', 'no llegó', 'nunca mas', 'malo', 'desastre', 'reclam', 'queja'];
    const positiveKeywords = ['excelente', 'gracias', 'genial', 'perfecto', 'buenísimo', 'buenisimo', 'agradecid', 'rápido', 'maravill'];

    let negativeCount = 0;
    let positiveCount = 0;

    negativeKeywords.forEach(k => { if (lower.includes(k)) negativeCount++; });
    positiveKeywords.forEach(k => { if (lower.includes(k)) positiveCount++; });

    if (negativeCount > 0) {
      const score = Math.max(15, 40 - (negativeCount * 15));
      return {
        label: 'frustrated',
        score: score,
        indicator: '🔴 Frustrado / Reclamo crítico',
        actionTaken: 'Prioridad ALTA asignada en CRM'
      };
    }

    if (positiveCount > 0) {
      const score = Math.min(98, 80 + (positiveCount * 10));
      return {
        label: 'positive',
        score: score,
        indicator: '🟢 Satisfecho / Receptivo',
        actionTaken: 'Experiencia óptima de compra'
      };
    }

    return {
      label: 'neutral',
      score: 72,
      indicator: '🟡 Informativo / Neutro',
      actionTaken: 'Flujo estándar de resolución rápida'
    };
  }

  /**
   * Genera la respuesta del bot con tarjetas ricas, botones y acciones de WhatsApp
   */
  _generateResponse(intentData, originalText) {
    const { intent, orderId } = intentData;

    switch (intent) {
      case 'ORDER_TRACKING': {
        const order = MOCK_DATABASE.orders[orderId] || MOCK_DATABASE.orders['AR-8492'];
        return {
          text: `¡Hola ${order.customer.name}! 👋 He verificado tu pedido *#${order.id}* en nuestro sistema logístico.

📦 *Producto:* ${order.item} (${order.variant})
🚚 *Estado:* ${order.statusLabel}
📍 *Ubicación actual:* ${order.lastUpdate}
⏱️ *Entrega estimada:* ${order.estimatedDelivery}
🏠 *Destino:* ${order.destinationAddress}

A continuación te dejo el visor de rastreo satelital con ${order.carrier}:`,
          richType: 'TRACKING_CARD',
          cardData: order,
          quickReplies: [
            { label: '📍 Ver chofer en mapa', action: 'view_map' },
            { label: '📦 Cambiar horario de entrega', action: 'reschedule_delivery' },
            { label: '👤 Hablar con asesor', action: 'escalate_human' }
          ]
        };
      }

      case 'RETURN_EXCHANGE': {
        const order = MOCK_DATABASE.orders[orderId] || MOCK_DATABASE.orders['AR-7210'];
        return {
          text: `¡Por supuesto ${order.customer.name}! 🔄 No te preocupes, el cambio de talle para tu *${order.item}* es **100% gratuito** dentro de tu garantía.

He generado tu solicitud de cambio automático:
✅ *Artículo original:* Talla M (Azul Marino)
➡️ *Nuevo artículo reservado:* Talla L (Listo en bodega)
🎟️ *Código de autorización:* #EX-2026-${order.id}

Te he adjuntado la etiqueta digital prepagada de DHL. Tienes dos opciones para entregarlo:`,
          richType: 'RETURN_LABEL_CARD',
          cardData: {
            orderId: order.id,
            item: order.item,
            exchangeVariant: 'Talla L - Color Azul Marino',
            carrier: 'DHL Express Devoluciones',
            pickupWindow: 'Mañana entre 09:00 y 13:00 hs',
            dropoffLocation: 'Punto DHL más cercano: Av. Santa Fe 3400 (a 400m de tu domicilio)'
          },
          quickReplies: [
            { label: '🚚 Programar retiro en mi casa', action: 'schedule_pickup' },
            { label: '🏪 Lo llevo a sucursal DHL', action: 'dropoff_branch' },
            { label: '❓ Preguntas sobre el cambio', action: 'return_faq' }
          ]
        };
      }

      case 'COMPLAINT_DELAY': {
        const order = MOCK_DATABASE.orders[orderId] || MOCK_DATABASE.orders['AR-9104'];
        return {
          text: `Comprendo totalmente tu molestia ${order.customer.name}, y te pido sinceras disculpas. Tienes toda la razón en estar inconforme. 🙏

Revisé de inmediato con el supervisor de ${order.carrier}:
⚠️ *Motivo detectado:* ${order.delayReason}.
📅 *Nueva fecha de entrega garantizada:* *${order.newEstimatedDelivery}* (Entrega prioritaria).

Para compensar las molestias ocasionadas por este retraso, he acreditado en tu cuenta un cupón del **15% OFF de por vida** para tu próxima compra:
🎁 Código: *${order.compensationOffered}*

Además, he activado el monitoreo en vivo para avisarte por WhatsApp apenas el repartidor esté a 5 cuadras.`,
          richType: 'COMPENSATION_CARD',
          cardData: {
            orderId: order.id,
            delayReason: order.delayReason,
            coupon: 'DISCULPAS15',
            discount: '15% OFF',
            priorityBadge: 'VIP Prioridad Máxima'
          },
          quickReplies: [
            { label: '✅ Aceptar nueva entrega', action: 'accept_delay' },
            { label: '👤 Transferir a Supervisor', action: 'escalate_human' },
            { label: '💵 Cancelar y reembolso 100%', action: 'request_refund' }
          ]
        };
      }

      case 'PRODUCT_STOCK_QUERY': {
        const product = MOCK_DATABASE.catalog[0]; // Zapatillas
        return {
          text: `¡Sí, tenemos disponibilidad inmediata! 👟✨

Para las *${product.name}* en **Talla 42**:
✅ *Stock físico:* 12 pares disponibles en centro de distribución local.
💵 *Precio:* ${product.price} (hasta 6 cuotas sin interés).
🚀 *Tiempo de entrega:* Si realizas el pedido antes de las 14:00 hs, ¡te llega **HOY MISMO** en reparto express!

¿Te gustaría que te genere un link de pago directo con envío prioritario reservado?`,
          richType: 'PRODUCT_CARD',
          cardData: product,
          quickReplies: [
            { label: '🛒 Comprar Talla 42 con 1 Clic', action: 'quick_buy' },
            { label: '📏 Ver guía de medidas', action: 'size_guide' },
            { label: '🔍 Ver otros modelos', action: 'see_more' }
          ]
        };
      }

      case 'POLICY_INQUIRY': {
        return {
          text: `Aquí tienes la información sobre nuestros envíos y pagos: 📦💳

🚚 *Tiempos y Envíos:*
• Envíos **GRATIS** en compras superiores a $50 USD.
• Envío Express en 24 hs hábiles o Estándar en 48-72 hs.

💳 *Medios de Pago:*
• Hasta 6 cuotas sin interés con todas las tarjetas de crédito.
• Mercado Pago, Débito, Apple Pay y 10% OFF extra por transferencia.

🔄 *Garantía y Devoluciones:*
• 30 días para cambios de talle gratuitos a domicilio.

¿Necesitas consultar por algún pedido en curso?`,
          richType: null,
          quickReplies: [
            { label: '🔍 Consultar mi pedido', action: 'track_order' },
            { label: '👟 Ver catálogo con envío gratis', action: 'view_catalog' }
          ]
        };
      }

      case 'HUMAN_ESCALATION': {
        return {
          text: `Entendido perfectamente. 🤝 Estoy transfiriendo esta conversación a un **especialista humano de nuestro equipo de soporte senior**.

📋 He compilado todo el resumen de tu consulta para que no tengas que repetir nada.
⏱️ *Tiempo estimado de conexión:* Menos de 45 segundos.
👨‍💼 *Agente asignado:* Matías Valenzuela (Atención al Cliente).`,
          richType: 'ESCALATION_CARD',
          cardData: {
            agentName: 'Matías Valenzuela',
            role: 'Especialista en Resolución Inmediata',
            status: 'Conectando...',
            waitTime: '< 45s'
          },
          quickReplies: [
            { label: '⏱️ Esperar agente', action: 'wait_agent' },
            { label: '📱 Dejar mensaje grabado', action: 'voice_note' }
          ]
        };
      }

      case 'GREETING':
      default: {
        return {
          text: `¡Hola! 👋 Te damos la bienvenida a la tienda oficial de atención automatizada *OmniFlow Store*.

Soy tu asistente virtual 24/7 impulsado por IA. Puedo ayudarte con:
1️⃣ Rastrear el estado de tu pedido en tiempo real
2️⃣ Gestionar cambios de talla y devoluciones sin esperas
3️⃣ Consultar stock de productos y promociones
4️⃣ Resolver cualquier reclamo o duda sobre envíos

¿En qué puedo ayudarte hoy?`,
          richType: null,
          quickReplies: [
            { label: '📦 Rastrear Pedido #AR-8492', action: 'track_sample' },
            { label: '🔄 Cambiar talle #AR-7210', action: 'return_sample' },
            { label: '👟 Stock Zapatillas Talla 42', action: 'stock_sample' }
          ]
        };
      }
    }
  }

  /**
   * Llamada opcional a LLM real (Gemini o OpenAI) si el usuario ingresó su propia clave
   */
  async _callLiveLLM(userPrompt, orderId) {
    const systemPrompt = `Eres el asistente inteligente de atención al cliente de OmniFlow Store, un e-commerce líder.
Responde de manera ejecutiva, cálida, concisa y profesional en español.
Usa formato de WhatsApp (negritas con asteriscos, emojis bien ubicados).
Base de datos actual:
- Pedido #AR-8492: Carlos Mendoza, Zapatillas Nike Running 42, En reparto hoy con DHL.
- Pedido #AR-7210: Sofía Ramírez, Chaqueta Explorer M, Entregado hace 2 días, elegible para cambio gratis.
- Pedido #AR-9104: Lucas Benítez, Auriculares Pro ANC, Retraso logístico menor, cupón DISCULPAS15 disponible.
Si el usuario hace un reclamo, sé empático, ofrece soluciones claras y no des rodeos.`;

    if (this.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        })
      });
      const data = await response.json();
      return {
        text: data.choices[0].message.content,
        intent: 'LIVE_LLM_OPENAI',
        confidence: 0.99,
        toolCalled: 'openai_chat_completion',
        quickReplies: [
          { label: '📦 Ver tracking', action: 'track_sample' },
          { label: '👤 Hablar con asesor', action: 'escalate_human' }
        ]
      };
    } else {
      // Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\nConsulta del cliente: ${userPrompt}` }]
          }]
        })
      });
      const data = await response.json();
      const answer = data.candidates[0].content.parts[0].text;
      return {
        text: answer,
        intent: 'LIVE_LLM_GEMINI',
        confidence: 0.99,
        toolCalled: 'gemini_flash_completion',
        quickReplies: [
          { label: '📦 Ver tracking', action: 'track_sample' },
          { label: '👤 Hablar con asesor', action: 'escalate_human' }
        ]
      };
    }
  }

  _simulateLatency(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
