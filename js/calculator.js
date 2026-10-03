/**
 * OmniFlow AI - Interactive ROI & Operational Savings Calculator
 * Calcula el ahorro de costes y tiempo en tiempo real para negocios de e-commerce
 */

export class ROICalculator {
  constructor() {
    this.inputs = {
      orders: document.getElementById('calc-orders-input'),
      rate: document.getElementById('calc-rate-input'),
      cost: document.getElementById('calc-cost-input')
    };

    this.displays = {
      ordersVal: document.getElementById('calc-orders-val'),
      rateVal: document.getElementById('calc-rate-val'),
      costVal: document.getElementById('calc-cost-val'),
      
      monthlySavings: document.getElementById('calc-monthly-savings'),
      annualSavings: document.getElementById('calc-annual-savings'),
      hoursSaved: document.getElementById('calc-hours-saved'),
      ticketsAutomated: document.getElementById('calc-tickets-automated'),
      paybackDays: document.getElementById('calc-payback-days')
    };

    this.init();
  }

  init() {
    if (!this.inputs.orders) return;

    // Escuchar cambios en los deslizadores
    this.inputs.orders.addEventListener('input', () => this.calculate());
    this.inputs.rate.addEventListener('input', () => this.calculate());
    this.inputs.cost.addEventListener('input', () => this.calculate());

    // Cálculo inicial
    this.calculate();
  }

  calculate() {
    const orders = parseInt(this.inputs.orders.value, 10);
    const ratePercent = parseInt(this.inputs.rate.value, 10);
    const agentCost = parseInt(this.inputs.cost.value, 10);

    // Actualizar etiquetas visuales de los sliders
    if (this.displays.ordersVal) {
      this.displays.ordersVal.textContent = orders.toLocaleString('es-ES') + ' pedidos/mes';
    }
    if (this.displays.rateVal) {
      this.displays.rateVal.textContent = `${ratePercent}%`;
    }
    if (this.displays.costVal) {
      this.displays.costVal.textContent = `$${agentCost.toLocaleString('es-ES')} USD/mes`;
    }

    // Cálculos de negocio:
    // 1. Total de tickets o consultas al mes
    const totalTickets = orders * (ratePercent / 100);
    
    // 2. OmniFlow automatiza entre el 75% y 85% de las consultas repetitivas (N1, tracking, cambios, FAQ)
    const automatedRate = 0.82;
    const ticketsAutomated = Math.round(totalTickets * automatedRate);

    // 3. Tiempo promedio de un humano por ticket = 9 minutos (0.15 horas)
    const hoursSaved = Math.round(ticketsAutomated * 0.15);

    // 4. Capacidad de un agente humano promedio = ~750 tickets/mes (160 horas laborales)
    const agentsEquivalent = ticketsAutomated / 750;
    
    // 5. Ahorro mensual bruto en personal / tercerización
    const monthlyGrossSavings = Math.round(agentsEquivalent * agentCost);
    
    // Costo estimado de suscripción/mantenimiento OmniFlow (~$350 a $650 según volumen)
    const omniflowFee = Math.min(1200, Math.max(350, Math.round(orders * 0.05)));
    const netMonthlySavings = Math.max(0, monthlyGrossSavings - omniflowFee);
    const netAnnualSavings = netMonthlySavings * 12;

    // Periodo de retorno de inversión (Payback en días)
    const paybackDays = Math.max(12, Math.min(45, Math.round(30 / (netMonthlySavings / (omniflowFee || 400)))));

    // Renderizar resultados con formato monetario
    this._animateNumber(this.displays.monthlySavings, netMonthlySavings, '$', ' USD');
    this._animateNumber(this.displays.annualSavings, netAnnualSavings, '$', ' USD');
    this._animateNumber(this.displays.hoursSaved, hoursSaved, '', ' hrs');
    this._animateNumber(this.displays.ticketsAutomated, ticketsAutomated, '', ' tickets');
    
    if (this.displays.paybackDays) {
      this.displays.paybackDays.textContent = `${paybackDays} días`;
    }
  }

  _animateNumber(element, targetValue, prefix = '', suffix = '') {
    if (!element) return;
    element.textContent = `${prefix}${targetValue.toLocaleString('es-ES')}${suffix}`;
  }
}
