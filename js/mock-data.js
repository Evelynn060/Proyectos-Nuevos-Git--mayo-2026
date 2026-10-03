/**
 * OmniFlow AI - Mock Database & Scenarios
 * Base de datos simulada realista para demostración de atención al cliente e-commerce
 */

export const MOCK_DATABASE = {
  // Base de datos de pedidos
  orders: {
    "AR-8492": {
      id: "AR-8492",
      customer: {
        name: "Carlos Mendoza",
        phone: "+54 9 11 4829-1044",
        email: "carlos.mendoza@email.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        totalOrders: 4,
        lifetimeValue: "$482.00 USD",
        segment: "Cliente Frecuente (VIP Tier 2)"
      },
      item: "Zapatillas Nike Air Zoom Running",
      variant: "Talla 42 - Color Negro/Volt",
      quantity: 1,
      price: "$129.99 USD",
      status: "en_transito",
      statusLabel: "En Tránsito (Última Milla)",
      statusCode: "IN_TRANSIT",
      carrier: "DHL Express",
      trackingNumber: "DHL-94821034-AR",
      trackingUrl: "https://track.dhl.com/sample",
      estimatedDelivery: "Hoy entre 14:30 y 18:00 hs",
      destinationAddress: "Av. del Libertador 4520, Piso 4B, CABA",
      lastUpdate: "09:45 hs - En móvil de reparto asignado a repartidor #84",
      timeline: [
        { step: "Pedido Confirmado", time: "Ayer 11:20", completed: true },
        { step: "Preparado en Bodega", time: "Ayer 16:40", completed: true },
        { step: "Despachado con DHL", time: "Hoy 07:15", completed: true },
        { step: "En Reparto Última Milla", time: "Hoy 09:45", active: true, completed: false },
        { step: "Entregado en Domicilio", time: "Estimado Hoy 16:00", completed: false }
      ]
    },
    "AR-7210": {
      id: "AR-7210",
      customer: {
        name: "Sofía Ramírez",
        phone: "+54 9 11 6512-8890",
        email: "sofia.ramirez@email.com",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        totalOrders: 2,
        lifetimeValue: "$210.50 USD",
        segment: "Cliente Estándar"
      },
      item: "Chaqueta Impermeable Explorer Pro",
      variant: "Talla M - Color Azul Marino",
      quantity: 1,
      price: "$89.50 USD",
      status: "entregado",
      statusLabel: "Entregado hace 2 días",
      statusCode: "DELIVERED",
      carrier: "FedEx Logística",
      trackingNumber: "FDX-77210992-AR",
      deliveryDate: "Hace 2 días (15:20 hs)",
      returnEligible: true,
      returnDeadline: "28 días restantes (Garantía de satisfacción)",
      destinationAddress: "Calle Serrano 1280, Palermo, CABA",
      timeline: [
        { step: "Pedido Confirmado", time: "28 Sep", completed: true },
        { step: "Preparado en Bodega", time: "29 Sep", completed: true },
        { step: "Despachado", time: "30 Sep", completed: true },
        { step: "Entregado", time: "01 Oct 15:20", completed: true }
      ]
    },
    "AR-9104": {
      id: "AR-9104",
      customer: {
        name: "Lucas Benítez",
        phone: "+54 9 11 3918-7744",
        email: "lucas.benitez@email.com",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        totalOrders: 1,
        lifetimeValue: "$199.00 USD",
        segment: "Nuevo Cliente"
      },
      item: "Auriculares Inalámbricos Pro Noise Cancelling",
      variant: "Color Space Gray",
      quantity: 1,
      price: "$199.00 USD",
      status: "retrasado",
      statusLabel: "Retraso Logístico Menor",
      statusCode: "DELAYED",
      carrier: "Urbano Express",
      trackingNumber: "URB-91044431-AR",
      delayReason: "Congestión por corte de tránsito en autopista norte",
      newEstimatedDelivery: "Mañana entre 10:00 y 14:00 hs",
      compensationOffered: "Cupón 15% OFF en próxima compra: DISCULPAS15",
      destinationAddress: "Av. Santa Fe 3200, CABA",
      timeline: [
        { step: "Pedido Confirmado", time: "01 Oct", completed: true },
        { step: "Despachado", time: "02 Oct", completed: true },
        { step: "Reprogramado por demora", time: "Hoy 08:30", active: true, warning: true },
        { step: "Entrega reprogramada", time: "Mañana 10:00 - 14:00", completed: false }
      ]
    }
  },

  // Catálogo de productos destacados
  catalog: [
    {
      id: "PROD-01",
      name: "Zapatillas Nike Air Zoom Running",
      category: "Calzado Deportivo",
      price: "$129.99 USD",
      stock: { "40": 4, "41": 8, "42": 12, "43": 2, "44": 0 },
      description: "Amortiguación reactiva con espuma ZoomX, ideal para entrenamiento diario y media maratón.",
      image: "👟"
    },
    {
      id: "PROD-02",
      name: "Chaqueta Impermeable Explorer Pro",
      category: "Indumentaria Outdoor",
      price: "$89.50 USD",
      stock: { "S": 3, "M": 10, "L": 6, "XL": 1 },
      description: "Membrana transpirable de 15.000 mm con costuras termoselladas y capucha ajustable.",
      image: "🧥"
    },
    {
      id: "PROD-03",
      name: "Auriculares Inalámbricos Pro ANC",
      category: "Tecnología / Audio",
      price: "$199.00 USD",
      stock: { "Space Gray": 14, "Matte White": 9 },
      description: "Cancelación activa de ruido híbrida de 40dB, 32 horas de batería y micrófonos con IA.",
      image: "🎧"
    }
  ],

  // Políticas y base de conocimientos (Knowledge Base para RAG)
  policies: {
    returns: "Tienes 30 días corridos desde recibido el producto para cambios gratuitos de talla o devoluciones. El sistema genera una etiqueta prepagada de DHL para que lo dejes en una sucursal o programemos retiro a domicilio sin costo.",
    shipping: "Envíos gratis en compras mayores a $50 USD. Tiempos de entrega: Estándar (48 a 72 hs hábiles), Express (24 hs hábiles o mismo día si compras antes de las 13:00 hs).",
    warranty: "Garantía oficial de 12 meses por defectos de fabricación con reemplazo directo.",
    paymentMethods: "Tarjetas de crédito hasta 6 cuotas sin interés, débito, Mercado Pago, Apple Pay y transferencia con 10% de descuento adicional."
  },

  // Escenarios preconfigurados de prueba rápida para visitantes y clientes
  scenarios: [
    {
      id: "tracking_8492",
      title: "Rastrear Pedido en Camino",
      badge: "Caso Típico (60% volumen)",
      subtitle: "Pedido #AR-8492 en reparto hoy",
      initialPrompt: "Hola! ¿Dónde viene mi pedido #AR-8492? Lo compré ayer.",
      orderId: "AR-8492",
      sentimentTarget: "positive",
      tags: ["Tracking", "DHL", "Entrega hoy"]
    },
    {
      id: "return_7210",
      title: "Gestión de Cambio de Talla",
      badge: "Automatización Completa",
      subtitle: "Cambio de talle M por L sin intervención humana",
      initialPrompt: "Hola, me llegó la chaqueta del pedido #AR-7210 pero me queda algo chica. ¿Puedo cambiarla de talle?",
      orderId: "AR-7210",
      sentimentTarget: "neutral",
      tags: ["Devolución", "Etiqueta Automática", "Cambio"]
    },
    {
      id: "delayed_9104",
      title: "Cliente Molesto por Demora",
      badge: "Desescalada Inteligente",
      subtitle: "Detección de frustración + compensación proactiva",
      initialPrompt: "Buenas, mi pedido #AR-9104 tenía que llegar hoy y no llegó nada! Estoy muy disconforme con el servicio.",
      orderId: "AR-9104",
      sentimentTarget: "frustrated",
      tags: ["Sentimiento Negativo", "Compensación", "Cupón"]
    },
    {
      id: "stock_query",
      title: "Consulta de Stock y Tallas",
      badge: "Asistente de Ventas",
      subtitle: "Conversión de compra en tiempo real",
      initialPrompt: "¿Tienen zapatillas para running en talla 42 disponibles y cuánto tardan en llegar?",
      orderId: null,
      sentimentTarget: "positive",
      tags: ["Ventas", "Catálogo", "Stock"]
    }
  ]
};
