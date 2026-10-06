import type { DifficultMomentType } from '@/domain/difficult-moment';
import type { EmotionIntensity } from '@/domain/types';

export type DifficultMomentContent = {
  title: string;
  intro: string;
  body: string;
  immediateStep: string;
  prayer: string | null;
  encourageHumanSupport: boolean;
};

const content: Record<Exclude<DifficultMomentType, 'unsafe'>, DifficultMomentContent> = {
  crying: {
    title: 'Puedes quedarte aquí un momento',
    intro: 'No tienes que detener inmediatamente tus lágrimas.',
    body:
      'Llorar puede ser una respuesta profundamente humana ante una ausencia que importa. Intenta no juzgarte ni exigirte recuperar el control demasiado rápido. Si puedes, siéntate, apoya los pies y deja que tu respiración encuentre un ritmo más tranquilo.',
    immediateStep:
      'Pon una mano sobre el pecho o el abdomen y respira lentamente. No busques “dejar de llorar”; busca solamente acompañar a tu cuerpo mientras llora.',
    prayer:
      'Señor Jesús, Tú también lloraste. Recibe mis lágrimas y quédate conmigo en este momento. Amén.',
    encourageHumanSupport: false,
  },
  anxiety: {
    title: 'Primero ayudemos a tu cuerpo',
    intro: 'No necesitas resolver tus pensamientos mientras la ansiedad está alta.',
    body:
      'Mira a tu alrededor y recuerda dónde estás. Apoya bien los pies, afloja los hombros y deja que la exhalación sea un poco más larga que la inhalación. Si algo físico se siente intenso, nuevo o preocupante, es importante buscar ayuda médica.',
    immediateStep:
      'Nombra 3 cosas que ves, 2 sonidos que escuchas y 1 sensación física. Después haz tres respiraciones lentas.',
    prayer:
      'Señor, aquieta lo que hoy está agitado en mí. Dame presencia, calma y compañía. Amén.',
    encourageHumanSupport: true,
  },
  guilt: {
    title: 'Miremos la culpa con verdad',
    intro: 'No voy a decirte automáticamente que fue o no fue tu culpa.',
    body:
      'La culpa necesita contexto. Podemos distinguir lo que realmente hiciste, lo que estaba bajo tu control y aquello que solo conoces ahora. Un error concreto merece verdad y, cuando sea posible, reparación. Una culpa construida desde el “si hubiera sabido” necesita también misericordia.',
    immediateStep:
      'Completa mentalmente dos frases: “En aquel momento yo sabía…” y “En aquel momento yo no sabía…”.',
    prayer:
      'Dios de misericordia, muéstrame con verdad aquello que debo reconocer y aquello que necesito aprender a entregarte. Amén.',
    encourageHumanSupport: false,
  },
  anger: {
    title: 'Puedes reconocer tu rabia',
    intro: 'Sentir rabia no te convierte en una mala persona ni en alguien sin fe.',
    body:
      'La rabia puede aparecer cuando algo profundamente amado ha sido herido o perdido. Importa expresarla sin hacerte daño ni hacer daño a otros. También puedes estar enojado con Dios y hablarle desde ahí; la oración bíblica conoce el clamor y la protesta.',
    immediateStep:
      'Termina esta frase: “Estoy enojado porque…”. Después camina unos minutos, escribe o habla con alguien seguro.',
    prayer:
      'Señor, hoy también te muestro mi rabia. Ayúdame a comprenderla y a no convertir mi dolor en daño. Amén.',
    encourageHumanSupport: false,
  },
  loneliness: {
    title: 'No necesitas estar solo con esto',
    intro: 'EMAÚS puede acompañarte unos minutos, pero no quiere reemplazar una presencia humana real.',
    body:
      'Cuando la soledad pesa mucho, una llamada, una visita o simplemente estar cerca de alguien puede hacer una diferencia. No necesitas explicar perfectamente lo que te pasa para pedir compañía.',
    immediateStep:
      'Piensa en una persona segura y envíale algo sencillo: “Hoy me está costando. ¿Puedes acompañarme un rato?”.',
    prayer:
      'Señor Jesús, cuando el silencio me pese, pon personas buenas a mi lado y ayúdame a dejarme acompañar. Amén.',
    encourageHumanSupport: true,
  },
  insomnia: {
    title: 'Por esta noche no tienes que resolver nada',
    intro: 'La noche puede hacer que los pensamientos y recuerdos se sientan más fuertes.',
    body:
      'No conviertas el sueño en otra batalla. Baja un poco la luz, deja el teléfono a un lado si puedes y permite que el cuerpo reduzca el ritmo. Si las dificultades para dormir se mantienen y afectan seriamente tu vida diaria, conviene pedir orientación profesional.',
    immediateStep:
      'Respira lentamente y repite: “Por hoy es suficiente. Lo que no pueda resolver esta noche puede esperar hasta mañana”.',
    prayer:
      'Señor, recibe lo que hoy no pude resolver. Cuida mi mente y mi cuerpo y concédeme descanso. Amén.',
    encourageHumanSupport: false,
  },
  fear: {
    title: 'Vamos a ponerle nombre al miedo',
    intro: 'Después de una pérdida pueden aparecer muchos temores diferentes.',
    body:
      'A veces el miedo se refiere a otra muerte, una enfermedad, quedarse solo, dormir o enfrentar el futuro. Saber qué miedo está aquí permite distinguir una amenaza presente de una posibilidad que la mente está anticipando.',
    immediateStep:
      'Completa: “Lo que más miedo me produce ahora es…”. Luego pregúntate: “¿Esto está ocurriendo ahora mismo?”.',
    prayer:
      'Señor, conoce mi miedo y camina conmigo dentro de él. Dame luz para el paso que sí puedo dar hoy. Amén.',
    encourageHumanSupport: false,
  },
  reminder: {
    title: 'Ese recuerdo llegó sin avisar',
    intro: 'Una canción, un olor, una calle o una fotografía pueden traer de golpe la ausencia.',
    body:
      'No significa que estés retrocediendo. El recuerdo encontró una puerta. Puedes reconocerlo y permitir que la emoción baje a su propio ritmo. Recordar forma parte de una historia de amor que ahora necesita aprender otra manera de estar presente.',
    immediateStep:
      'Di sencillamente: “Esto me recordó a mi ser querido”. Respira y decide si hoy quieres guardar ese recuerdo o dejarlo pasar.',
    prayer:
      'Señor, cuando los recuerdos lleguen con fuerza, sostén mi corazón y enséñame a recibirlos con libertad. Amén.',
    encourageHumanSupport: false,
  },
  need_god: {
    title: 'Puedes encontrarte con Dios como estás',
    intro: 'No necesitas palabras perfectas ni sentirte espiritualmente “bien”.',
    body:
      'Puedes rezar, guardar silencio, preguntar, llorar o decir que estás enojado. Dios no necesita una versión maquillada de tu corazón. La fe también puede comenzar con una frase muy pequeña: “Señor, aquí estoy”.',
    immediateStep:
      'Quédate en silencio durante unos segundos y dile a Dios una sola frase completamente sincera.',
    prayer:
      'Señor, aquí estoy. Tú sabes lo que llevo dentro. Quédate conmigo y no me dejes caminar solo. Amén.',
    encourageHumanSupport: false,
  },
  need_talk: {
    title: 'Buscar una voz humana también es cuidarte',
    intro: 'No necesitas esperar a estar peor para hablar con alguien.',
    body:
      'Puedes buscar a un familiar, amigo, sacerdote o profesional de confianza. No tienes que explicar todo; basta con decir que hoy necesitas compañía. Si sientes que no puedes mantenerte seguro, la prioridad es estar con otra persona y buscar ayuda inmediata.',
    immediateStep:
      'Elige ahora mismo a una persona concreta a quien puedas llamar o escribir.',
    prayer:
      'Señor, dame humildad para pedir ayuda y pon cerca de mí personas capaces de acompañarme con respeto y paciencia. Amén.',
    encourageHumanSupport: true,
  },
  unknown: {
    title: 'Está bien no saber qué sientes',
    intro: 'No vamos a obligarte a poner una etiqueta.',
    body:
      'Podemos empezar por algo más sencillo: notar el cuerpo y descubrir qué necesitas. Tal vez estás cansado, tenso, vacío, inquieto o simplemente no sabes. Eso también es una respuesta válida.',
    immediateStep:
      'Pregúntate únicamente: “¿Necesito descanso, silencio, compañía, movimiento o oración?”.',
    prayer:
      'Señor, cuando no sé qué decir ni qué siento, recibe también mi silencio. Amén.',
    encourageHumanSupport: false,
  },
};

export function getDifficultMomentContent(
  type: Exclude<DifficultMomentType, 'unsafe'>,
  intensity: EmotionIntensity
) {
  const source = content[type];

  return {
    ...source,
    encourageHumanSupport:
      source.encourageHumanSupport || intensity === 'strong',
  };
}
