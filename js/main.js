/**
 * OmniFlow AI - Main Controller & Orchestrator
 * Coordina el chat de WhatsApp, el panel CRM, los presets y la calculadora
 */

import { MOCK_DATABASE } from './mock-data.js';
import { BotEngine } from './bot-engine.js';
import { CRMSync } from './crm-sync.js';
import { ROICalculator } from './calculator.js';

class OmniFlowApp {
  constructor() {
    this.bot = new BotEngine();
    this.crm = new CRMSync();
    this.calc = new ROICalculator();

    this.chatBody = document.getElementById('wa-chat-body');
    this.inputBox = document.getElementById('wa-input-box');
    this.sendBtn = document.getElementById('wa-send-btn');
    this.typingIndicator = document.getElementById('wa-typing-indicator');
    this.quickRepliesContainer = document.getElementById('wa-quick-replies');

    this.isProcessing = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderPresets();
    this.renderInitialBotGreeting();
    this.setupModal();
    this.setupBookingModal();
  }

  setupEventListeners() {
    // Enviar mensaje con el botón o con la tecla Enter
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (this.inputBox) {
      this.inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Botón de reinicio de la demo
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetDemo());
    }

    // Formulario de contacto
    const contactForm = document.getElementById('lead-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactSubmit();
      });
    }
  }

  renderPresets() {
    const pillsRow = document.getElementById('scenario-pills-row');
    if (!pillsRow) return;

    pillsRow.innerHTML = '';
    MOCK_DATABASE.scenarios.forEach((scenario, idx) => {
      const btn = document.createElement('button');
      btn.className = `scenario-btn ${idx === 0 ? 'active' : ''}`;
      btn.innerHTML = `
        <span>${scenario.title}</span>
        <span class="scenario-badge">${scenario.badge}</span>
      `;
      btn.addEventListener('click', () => {
        // Remover activo de otros
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.runScenario(scenario);
      });
      pillsRow.appendChild(btn);
    });
  }

  async runScenario(scenario) {
    if (this.isProcessing) return;
    if (this.inputBox) {
      this.inputBox.value = scenario.initialPrompt;
    }
    await this.handleSendMessage();
  }

  renderInitialBotGreeting() {
    this.chatBody.innerHTML = '';

    // Chip de fecha de hoy
    const dateChip = document.createElement('div');
    dateChip.className = 'wa-date-chip';
    dateChip.textContent = 'HOY';
    this.chatBody.appendChild(dateChip);

    // Mensaje de bienvenida inicial del asistente
    const greetingText = `¡Hola! 👋 Te damos la bienvenida al canal oficial de atención inteligente de *OmniFlow Store*.

Soy tu asistente virtual 24/7. Puedo ayudarte con:
📦 Rastreo satelital de pedidos
🔄 Cambios de talle y devoluciones con etiqueta prepaga
👟 Consultas de stock y compra rápida
👤 Derivación directa a un asesor humano

¿Cómo puedo ayudarte en este momento?`;

    this.appendBotMessage({
      text: greetingText,
      quickReplies: [
        { label: '📦 Rastrear Pedido #AR-8492', text: 'Hola! ¿Dónde viene mi pedido #AR-8492?' },
        { label: '🔄 Cambiar Talla #AR-7210', text: 'Hola, quiero gestionar el cambio de talle de mi compra #AR-7210' },
        { label: '👟 Stock Zapatillas Talla 42', text: '¿Tienen stock de zapatillas para running en talla 42?' }
      ]
    });
  }

  async handleSendMessage(overrideText = null) {
    const text = overrideText || (this.inputBox ? this.inputBox.value.trim() : '');
    if (!text || this.isProcessing) return;

    this.isProcessing = true;
    if (this.inputBox) this.inputBox.value = '';

    // 1. Mostrar mensaje saliente del usuario en WhatsApp
    this.appendUserMessage(text);

    // 2. Registrar evento entrante en el CRM
    this.crm.logTrigger(`Mensaje entrante del cliente: "${text.substring(0, 36)}..."`, 'API');

    // 3. Activar indicador de escribiendo
    this.showTyping(true);

    try {
      // 4. Procesar a través del motor inteligente
      const response = await this.bot.processMessage(text, (step) => {
        if (step.tool) {
          this.crm.logTrigger(`Invocando integración: ${step.tool}`, 'API');
        }
      });

      // 5. Ocultar indicador y renderizar respuesta del bot
      this.showTyping(false);
      this.appendBotMessage(response);

      // 6. Sincronizar en tiempo real el panel CRM
      this.crm.syncFullTurn({
        orderId: response.cardData?.orderId || response.cardData?.id || this.bot.currentContext.detectedOrderId,
        sentiment: response.sentiment,
        intent: response.intent,
        toolCalled: response.toolCalled,
        executionTimeMs: response.executionTimeMs
      });

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      this.showTyping(false);
      this.appendBotMessage({
        text: 'Disculpa, ha ocurrido una intermitencia momentánea. Un asesor humano ha sido notificado.',
        quickReplies: [{ label: '👤 Hablar con asesor', text: 'Quiero hablar con un humano' }]
      });
    } finally {
      this.isProcessing = false;
    }
  }

  appendUserMessage(text) {
    const timeStr = this.getCurrentTime();
    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble wa-bubble-outgoing anim-fade-in';
    bubble.innerHTML = `
      <div class="wa-msg-text">${this.formatWhatsAppMarkdown(text)}</div>
      <div class="wa-msg-meta outgoing">
        <span>${timeStr}</span>
        <span class="wa-ticks">✓✓</span>
      </div>
    `;
    this.chatBody.appendChild(bubble);
    this.scrollToBottom();
  }

  appendBotMessage(payload) {
    const timeStr = this.getCurrentTime();
    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble wa-bubble-incoming anim-fade-in';

    let html = `<div class="wa-msg-text">${this.formatWhatsAppMarkdown(payload.text)}</div>`;

    // Renderizar tarjetas ricas según el tipo de datos
    if (payload.richType === 'TRACKING_CARD' && payload.cardData) {
      html += this.renderTrackingCard(payload.cardData);
    } else if (payload.richType === 'RETURN_LABEL_CARD' && payload.cardData) {
      html += this.renderReturnCard(payload.cardData);
    } else if (payload.richType === 'COMPENSATION_CARD' && payload.cardData) {
      html += this.renderCompensationCard(payload.cardData);
    } else if (payload.richType === 'PRODUCT_CARD' && payload.cardData) {
      html += this.renderProductCard(payload.cardData);
    } else if (payload.richType === 'ESCALATION_CARD' && payload.cardData) {
      html += this.renderEscalationCard(payload.cardData);
    }

    html += `
      <div class="wa-msg-meta">
        <span>${timeStr}</span>
      </div>
    `;

    bubble.innerHTML = html;
    this.chatBody.appendChild(bubble);

    // Actualizar botones de respuesta rápida
    this.renderQuickReplies(payload.quickReplies);
    this.scrollToBottom();
  }

  renderTrackingCard(order) {
    let timelineHtml = '';
    if (order.timeline) {
      timelineHtml = order.timeline.map(t => `
        <div class="tracking-step">
          <div class="step-circle ${t.completed ? 'done' : ''} ${t.active ? 'active' : ''}"></div>
          <div class="step-text ${t.active ? 'active' : ''}">${t.step}</div>
          <div class="step-time">${t.time}</div>
        </div>
      `).join('');
    }

    return `
      <div class="wa-rich-card">
        <div class="tracking-header">
          <div class="tracking-carrier">🚚 ${order.carrier} Tracking</div>
          <div class="status-tag tag-info">${order.statusCode || 'IN_TRANSIT'}</div>
        </div>
        <div class="tracking-timeline">
          ${timelineHtml}
        </div>
        <div style="margin-top: 10px; font-size: 0.74rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
          Guía: <b style="color: #f8fafc;">${order.trackingNumber}</b>
        </div>
      </div>
    `;
  }

  renderReturnCard(data) {
    return `
      <div class="wa-rich-card">
        <span class="return-card-badge">✅ AUTORIZACIÓN APROBADA</span>
        <div style="font-size: 0.8rem; color: #e2e8f0; margin-bottom: 6px;">
          <b>Cambio por:</b> ${data.exchangeVariant}
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8;">
          📍 ${data.dropoffLocation}
        </div>
        <div class="barcode-preview">
          ||| |||||| | ||||| |||| ||||||<br>
          DHL-RET-${data.orderId}-AUTO
        </div>
      </div>
    `;
  }

  renderCompensationCard(data) {
    return `
      <div class="wa-rich-card">
        <div style="font-size: 0.8rem; color: #ef4444; font-weight: 700; margin-bottom: 4px;">
          ⚠️ Prioridad Logística Activada
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1;">
          Motivo: ${data.delayReason}
        </div>
        <div class="coupon-box">
          <div>
            <div style="font-size: 0.68rem; color: #fed7aa; text-transform: uppercase;">Cupón Especial</div>
            <div class="coupon-code">${data.coupon}</div>
          </div>
          <div class="status-tag tag-urgent">${data.discount}</div>
        </div>
      </div>
    `;
  }

  renderProductCard(product) {
    return `
      <div class="wa-rich-card">
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="font-size: 2.2rem;">${product.image}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #f8fafc;">${product.name}</div>
            <div style="font-size: 0.78rem; color: #22c55e; font-weight: 700;">${product.price} • Stock Disponible</div>
          </div>
        </div>
      </div>
    `;
  }

  renderEscalationCard(data) {
    return `
      <div class="wa-rich-card">
        <div style="display: flex; gap: 10px; align-items: center;">
          <div style="font-size: 1.8rem;">👨‍💼</div>
          <div>
            <div style="font-weight: 700; font-size: 0.84rem; color: #f8fafc;">${data.agentName}</div>
            <div style="font-size: 0.74rem; color: #38bdf8;">${data.role} (${data.waitTime})</div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuickReplies(replies) {
    if (!this.quickRepliesContainer) return;
    this.quickRepliesContainer.innerHTML = '';

    if (!replies || replies.length === 0) return;

    replies.forEach(r => {
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = r.label;
      btn.addEventListener('click', () => {
        this.handleSendMessage(r.text || r.label);
      });
      this.quickRepliesContainer.appendChild(btn);
    });
  }

  showTyping(show) {
    if (!this.typingIndicator) return;
    if (show) {
      this.typingIndicator.classList.add('active');
    } else {
      this.typingIndicator.classList.remove('active');
    }
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.chatBody) {
      this.chatBody.scrollTop = this.chatBody.scrollHeight;
    }
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  formatWhatsAppMarkdown(text) {
    if (!text) return '';
    // Formatea negritas *texto* a <b>texto</b>
    let formatted = text.replace(/\*(.*?)\*/g, '<b>$1</b>');
    // Saltos de línea a <br>
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  resetDemo() {
    this.bot = new BotEngine();
    this.crm.initDefaultState();
    this.renderInitialBotGreeting();
    this.crm.logTrigger('Demostración reiniciada por el usuario.', 'SYSTEM');
  }

  handleContactSubmit() {
    const toast = document.createElement('div');
    toast.className = 'status-tag tag-success';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.padding = '14px 20px';
    toast.style.fontSize = '0.9rem';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.innerHTML = '✅ ¡Mensaje enviado con éxito! Un especialista de OmniFlow AI te contactará en breve.';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4500);

    const form = document.getElementById('lead-contact-form');
    if (form) form.reset();
  }

  setupModal() {
    const modal = document.getElementById('api-key-modal');
    const openBtn = document.getElementById('btn-open-api-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const saveBtn = document.getElementById('btn-save-api-key');
    const clearBtn = document.getElementById('btn-clear-api-key');
    const inputKey = document.getElementById('custom-api-key-input');
    const selectProvider = document.getElementById('ai-provider-select');
    const liveBadge = document.getElementById('live-ai-badge');

    if (!modal) return;

    const updateBadge = () => {
      if (this.bot.hasCustomApiKey()) {
        if (liveBadge) {
          liveBadge.textContent = `IA EN VIVO (${this.bot.provider.toUpperCase()})`;
          liveBadge.className = 'brand-badge pulse-badge';
          liveBadge.style.color = '#00d2ff';
          liveBadge.style.borderColor = '#00d2ff';
        }
      } else {
        if (liveBadge) {
          liveBadge.textContent = 'MOTOR INTELIGENTE ACTIVO';
          liveBadge.className = 'brand-badge';
          liveBadge.style.color = 'var(--brand-wa)';
          liveBadge.style.borderColor = 'var(--border-glass-wa)';
        }
      }
    };

    updateBadge();

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        if (inputKey && this.bot.apiKey) inputKey.value = this.bot.apiKey;
        if (selectProvider && this.bot.provider) selectProvider.value = this.bot.provider;
        modal.classList.add('active');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const key = inputKey ? inputKey.value.trim() : '';
        const provider = selectProvider ? selectProvider.value : 'gemini';
        this.bot.setApiKey(key, provider);
        updateBadge();
        modal.classList.remove('active');
        this.crm.logTrigger(`Motor configurado en modo IA en vivo con ${provider.toUpperCase()}`, 'SYSTEM');
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.bot.setApiKey(null);
        if (inputKey) inputKey.value = '';
        updateBadge();
        modal.classList.remove('active');
        this.crm.logTrigger('Modo IA restablecido a motor simulado estándar.', 'SYSTEM');
      });
    }
  }

  setupBookingModal() {
    const bookingModal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('booking-modal-close-btn');
    const cancelBtn = document.getElementById('btn-cancel-booking');
    const bookingForm = document.getElementById('booking-form');
    const dateInput = document.getElementById('booking-date');

    if (!bookingModal) return;

    // Configurar fecha mínima como hoy
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      dateInput.value = today;
    }

    const closeModal = () => {
      bookingModal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeModal();
    });

    // Abrir modal desde cualquier botón o enlace con atributo data-open-booking
    document.querySelectorAll('[data-open-booking]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        bookingModal.classList.add('active');
      });
    });

    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('booking-name')?.value || 'Cliente';
        const date = document.getElementById('booking-date')?.value || '';
        const time = document.getElementById('booking-time')?.value || '';

        closeModal();

        // Mostrar notificación de confirmación
        const toast = document.createElement('div');
        toast.className = 'status-tag tag-success';
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '16px 28px';
        toast.style.fontSize = '0.95rem';
        toast.style.zIndex = '99999';
        toast.style.boxShadow = '0 12px 40px rgba(0,0,0,0.7)';
        toast.innerHTML = `🎉 <b>¡Sesión Confirmada, ${name}!</b> Te esperamos el <b>${date} a las ${time} hs</b>. Te enviamos la invitación a tu correo.`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 6000);
        bookingForm.reset();

        this.crm.logTrigger(`Nueva reunión de demo agendada para ${name} (${date} ${time})`, 'CRM');
      });
    }
  }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.omniflow = new OmniFlowApp();
});
