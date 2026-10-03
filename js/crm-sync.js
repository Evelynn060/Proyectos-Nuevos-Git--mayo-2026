/**
 * OmniFlow AI - Real-Time CRM & Operations Center Synchronizer
 * Gestiona el panel de control operativo que se actualiza en vivo con la actividad del bot
 */

import { MOCK_DATABASE } from './mock-data.js';

export class CRMSync {
  constructor() {
    this.elements = {
      customerAvatar: document.getElementById('crm-customer-avatar'),
      customerName: document.getElementById('crm-customer-name'),
      customerEmail: document.getElementById('crm-customer-email'),
      customerSegment: document.getElementById('crm-customer-segment'),
      customerLtv: document.getElementById('crm-customer-ltv'),
      customerOrdersCount: document.getElementById('crm-customer-orders-count'),
      
      sentimentMeterBar: document.getElementById('crm-sentiment-bar'),
      sentimentScoreVal: document.getElementById('crm-sentiment-score'),
      sentimentBadge: document.getElementById('crm-sentiment-badge'),
      
      ticketId: document.getElementById('crm-ticket-id'),
      ticketPriority: document.getElementById('crm-ticket-priority'),
      ticketStatus: document.getElementById('crm-ticket-status'),
      responseTimeVal: document.getElementById('crm-response-time'),
      
      triggersList: document.getElementById('crm-triggers-list'),
      reasoningTrace: document.getElementById('crm-reasoning-trace'),
      orderJsonView: document.getElementById('crm-order-json')
    };

    this.currentTicketNumber = 4821;
    this.initDefaultState();
  }

  initDefaultState() {
    this.updateCustomer(MOCK_DATABASE.orders['AR-8492'].customer);
    this.updateOrderInspector(MOCK_DATABASE.orders['AR-8492']);
    this.updateSentiment({ label: 'neutral', score: 75, indicator: '🟡 Neutro' });
    this.logTrigger('Sistema OmniFlow listo. Esperando interacciones en canal WhatsApp Cloud API...', 'SYSTEM');
  }

  updateCustomer(customer) {
    if (!customer) return;
    if (this.elements.customerAvatar) this.elements.customerAvatar.src = customer.avatar;
    if (this.elements.customerName) this.elements.customerName.textContent = customer.name;
    if (this.elements.customerEmail) this.elements.customerEmail.textContent = customer.email;
    if (this.elements.customerSegment) this.elements.customerSegment.textContent = customer.segment;
    if (this.elements.customerLtv) this.elements.customerLtv.textContent = customer.lifetimeValue;
    if (this.elements.customerOrdersCount) this.elements.customerOrdersCount.textContent = `${customer.totalOrders} pedidos`;
  }

  updateSentiment(sentiment) {
    if (!sentiment) return;
    const score = sentiment.score || 70;
    
    if (this.elements.sentimentScoreVal) {
      this.elements.sentimentScoreVal.textContent = `${score}%`;
    }

    if (this.elements.sentimentMeterBar) {
      this.elements.sentimentMeterBar.style.width = `${score}%`;
      if (score < 45) {
        this.elements.sentimentMeterBar.style.background = 'linear-gradient(90deg, #ef4444, #f97316)';
      } else if (score < 75) {
        this.elements.sentimentMeterBar.style.background = 'linear-gradient(90deg, #eab308, #38bdf8)';
      } else {
        this.elements.sentimentMeterBar.style.background = 'linear-gradient(90deg, #22c55e, #10b981)';
      }
    }

    if (this.elements.sentimentBadge) {
      if (sentiment.label === 'frustrated') {
        this.elements.sentimentBadge.className = 'status-tag tag-urgent';
        this.elements.sentimentBadge.textContent = '🔴 Cliente Frustrado';
      } else if (sentiment.label === 'positive') {
        this.elements.sentimentBadge.className = 'status-tag tag-success';
        this.elements.sentimentBadge.textContent = '🟢 Cliente Satisfecho';
      } else {
        this.elements.sentimentBadge.className = 'status-tag tag-neutral';
        this.elements.sentimentBadge.textContent = '🟡 Consulta Regular';
      }
    }
  }

  updateTicketInfo(intent, sentiment, executionMs = 820) {
    this.currentTicketNumber++;
    if (this.elements.ticketId) {
      this.elements.ticketId.textContent = `#TK-2026-${this.currentTicketNumber}`;
    }

    if (this.elements.responseTimeVal) {
      this.elements.responseTimeVal.textContent = `${(executionMs / 1000).toFixed(2)}s (Auto)`;
    }

    if (this.elements.ticketPriority) {
      if (sentiment && sentiment.label === 'frustrated') {
        this.elements.ticketPriority.className = 'status-tag tag-urgent';
        this.elements.ticketPriority.textContent = 'URGENTE (P1)';
      } else if (intent === 'HUMAN_ESCALATION') {
        this.elements.ticketPriority.className = 'status-tag tag-warning';
        this.elements.ticketPriority.textContent = 'ALTA (P2)';
      } else {
        this.elements.ticketPriority.className = 'status-tag tag-info';
        this.elements.ticketPriority.textContent = 'NORMAL (P3)';
      }
    }

    if (this.elements.ticketStatus) {
      if (intent === 'HUMAN_ESCALATION') {
        this.elements.ticketStatus.className = 'status-tag tag-warning';
        this.elements.ticketStatus.textContent = 'En Transferencia a Agente';
      } else {
        this.elements.ticketStatus.className = 'status-tag tag-success';
        this.elements.ticketStatus.textContent = 'Resuelto Autónomamente';
      }
    }
  }

  updateOrderInspector(orderData) {
    if (!orderData || !this.elements.orderJsonView) return;
    
    // Mostramos un resumen JSON formateado y legible
    const cleanObject = {
      orderId: orderData.id,
      customer: orderData.customer ? orderData.customer.name : 'Desconocido',
      item: orderData.item,
      status: orderData.statusCode || orderData.status,
      carrier: orderData.carrier,
      trackingNumber: orderData.trackingNumber,
      estimatedDelivery: orderData.estimatedDelivery || orderData.deliveryDate,
      destination: orderData.destinationAddress
    };

    this.elements.orderJsonView.textContent = JSON.stringify(cleanObject, null, 2);
  }

  updateReasoningTrace(steps) {
    if (!this.elements.reasoningTrace) return;
    this.elements.reasoningTrace.innerHTML = '';

    steps.forEach((step, idx) => {
      const stepEl = document.createElement('div');
      stepEl.className = `trace-step ${step.active ? 'active' : ''} ${step.done ? 'done' : ''}`;
      stepEl.innerHTML = `
        <div class="trace-number">${idx + 1}</div>
        <div class="trace-info">
          <div class="trace-title">${step.title}</div>
          <div class="trace-detail">${step.detail}</div>
        </div>
      `;
      this.elements.reasoningTrace.appendChild(stepEl);
    });
  }

  logTrigger(description, type = 'WEBHOOK') {
    if (!this.elements.triggersList) return;

    const timeStr = new Date().toLocaleTimeString('es-AR', { hour12: false });
    const li = document.createElement('li');
    li.className = `trigger-item trigger-${type.toLowerCase()}`;

    let icon = '⚡';
    if (type === 'API') icon = '🔌';
    if (type === 'NLP') icon = '🧠';
    if (type === 'CRM') icon = '📊';
    if (type === 'ALERT') icon = '🚨';
    if (type === 'SUCCESS') icon = '✅';

    li.innerHTML = `
      <span class="trigger-time">${timeStr}</span>
      <span class="trigger-type">[${type}]</span>
      <span class="trigger-icon">${icon}</span>
      <span class="trigger-desc">${description}</span>
    `;

    // Mantener máximo 8 logs visibles
    this.elements.triggersList.insertBefore(li, this.elements.triggersList.firstChild);
    while (this.elements.triggersList.children.length > 8) {
      this.elements.triggersList.removeChild(this.elements.triggersList.lastChild);
    }
  }

  syncFullTurn(turnData) {
    const { orderId, sentiment, intent, toolCalled, executionTimeMs } = turnData;
    
    // 1. Pedido y cliente
    if (orderId && MOCK_DATABASE.orders[orderId]) {
      const order = MOCK_DATABASE.orders[orderId];
      this.updateCustomer(order.customer);
      this.updateOrderInspector(order);
    }

    // 2. Sentimiento y Ticket
    this.updateSentiment(sentiment);
    this.updateTicketInfo(intent, sentiment, executionTimeMs);

    // 3. Traza de razonamiento paso a paso
    const traceSteps = [
      { title: 'Mensaje Recibido', detail: 'Webhook WhatsApp Cloud API verificado (HMAC SHA256)', done: true },
      { title: 'Clasificación de Intención', detail: `Intención: ${intent} (Confianza: 98%)`, done: true },
      { title: 'Ejecución de Herramienta', detail: `Tool: ${toolCalled || 'RAG Knowledge Search'}`, done: true },
      { title: 'Actualización en CRM', detail: 'Ticket sincronizado y respuesta renderizada', done: true, active: true }
    ];
    this.updateReasoningTrace(traceSteps);

    // 4. Logs en el feed de disparadores
    this.logTrigger(`NLP Intent clasificado: ${intent} (Sentimiento: ${sentiment.label})`, 'NLP');
    if (toolCalled) {
      this.logTrigger(`Herramienta ejecutada: ${toolCalled}`, 'API');
    }
    this.logTrigger(`Ticket #${this.currentTicketNumber} actualizado automáticamente (${executionTimeMs}ms)`, 'CRM');
  }
}
