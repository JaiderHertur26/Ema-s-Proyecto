import type { AccompanimentDecision } from '@/domain/accompaniment-engine';
import type { Emotion } from '@/domain/types';

export type AccompanimentCopy = {
  intro: string;
  scripture: string;
  reference: string;
  walking: string;
  smallStep: string;
  prayer: string;
};

const general: AccompanimentCopy = {
  intro: 'No tienes que resolver hoy todo lo que estás sintiendo.',
  scripture: '“Yo soy la resurrección y la vida.”',
  reference: 'Jn 11,25',
  walking:
    'El duelo no necesita ser recorrido de una sola vez. Hoy basta con reconocer cómo está tu corazón y dar un paso posible.',
  smallStep: 'Regálate unos minutos sin exigirte estar bien. Por hoy, eso es suficiente.',
  prayer:
    'Señor Jesús, acompáñame en este día. Recibe en tu misericordia a {{lovedOne}} y sostén mi corazón en la esperanza. Amén.',
};

const emotionCopy: Partial<Record<Emotion, AccompanimentCopy>> = {
  sadness: {
    intro: 'Hoy no necesitamos apresurarnos a sentirnos mejor.',
    scripture: '“El Señor está cerca de los corazones quebrantados.”',
    reference: 'Sal 34',
    walking:
      'La tristeza puede aparecer porque alguien significó profundamente para nosotros. Puedes sentirla sin convertirla en una medida de tu fe.',
    smallStep: 'Si necesitas llorar, busca un lugar seguro y permítete unos minutos sin juzgarte.',
    prayer:
      'Señor Jesús, Tú conoces mi tristeza. Quédate conmigo y recibe en tu misericordia a {{lovedOne}}. Amén.',
  },
  yearning: {
    intro: 'Hoy la ausencia parece sentirse especialmente cerca.',
    scripture: '“Te doy gracias cada vez que me acuerdo de ti.”',
    reference: 'cf. Flp 1,3',
    walking:
      'Extrañar también habla del lugar que esa persona ocupó en tu vida. Recordar no significa retroceder; podemos aprender a recordar con dolor y también con gratitud.',
    smallStep: 'Recuerda una escena sencilla que te haga agradecer haber compartido su vida.',
    prayer:
      'Gracias, Señor, por la vida de {{lovedOne}}. Cuando lo extrañe, convierte poco a poco mi nostalgia en memoria agradecida. Amén.',
  },
  anxiety: {
    intro: 'Primero ayudemos un poco a tu cuerpo a sentirse más seguro.',
    scripture: '“No temas, porque yo estoy contigo.”',
    reference: 'Is 41,10',
    walking:
      'No necesitas analizarlo todo mientras la ansiedad está alta. Vuelve al presente: apoya los pies, mira a tu alrededor y deja que la respiración se haga un poco más lenta.',
    smallStep: 'Haz tres respiraciones lentas y nombra tres cosas que ves a tu alrededor.',
    prayer:
      'Señor, aquieta lo que hoy está agitado en mí. Quédate cerca y ayúdame a atravesar este momento con calma. Amén.',
  },
  guilt: {
    intro: 'Hay algo que parece estar pesando mucho sobre tu corazón.',
    scripture: '“Dios es mayor que nuestro corazón.”',
    reference: '1 Jn 3,20',
    walking:
      'La culpa necesita verdad y misericordia. No vamos a absolverte ni condenarte sin mirar lo ocurrido. Podemos distinguir lo que estaba bajo tu control de aquello que solo conoces ahora.',
    smallStep: 'Completa: “En aquel momento yo sabía…” y luego: “En aquel momento yo no sabía…”.',
    prayer:
      'Dios de misericordia, muéstrame lo que debo reconocer, reparar o entregarte. No permitas que la culpa destruya mi vida. Amén.',
  },
  anger: {
    intro: 'Puedes decir aquí que estás enojado. No necesitas esconderlo.',
    scripture: '“¿Hasta cuándo, Señor?”',
    reference: 'Sal 13',
    walking:
      'La rabia puede aparecer cuando algo profundamente amado ha sido herido o perdido. Sentirla no te hace una mala persona; importa aprender a expresarla sin hacerte daño ni dañar a otros.',
    smallStep: 'Ponle una frase a tu rabia: “Estoy enojado porque…”.',
    prayer:
      'Señor, hoy también te muestro mi rabia. Ayúdame a comprenderla y a no convertir mi dolor en daño. Amén.',
  },
  loneliness: {
    intro: 'No tienes que atravesar este momento completamente solo.',
    scripture: '“Yo estoy con ustedes todos los días.”',
    reference: 'Mt 28,20',
    walking:
      'La aplicación puede acompañarte un momento, pero hay dolores que necesitan una voz, una presencia y una mano reales. Pedir compañía también es una forma de cuidarte.',
    smallStep: 'Piensa en una persona segura y envíale un mensaje sencillo: “¿Tienes un momento para hablar?”.',
    prayer:
      'Señor Jesús, cuando el silencio me pese, pon personas buenas a mi lado y enséñame a dejarme acompañar. Amén.',
  },
  fear: {
    intro: 'Vamos a mirar este miedo sin dejar que decida todo por ti.',
    scripture: '“Aunque camine por valle oscuro, nada temo, porque Tú vas conmigo.”',
    reference: 'Sal 23',
    walking:
      'Después de una pérdida pueden aparecer muchos miedos: a otra muerte, a enfermar, a quedarse solo o al futuro. Primero necesitamos saber qué miedo está aquí, hoy.',
    smallStep: 'Termina esta frase: “Lo que más miedo me da ahora es…”.',
    prayer:
      'Señor, conoce mi miedo y camina conmigo dentro de él. Dame luz para el paso que sí puedo dar hoy. Amén.',
  },
  peace: {
    intro: 'Recibe este momento de paz sin sentir culpa.',
    scripture: '“La paz les dejo, mi paz les doy.”',
    reference: 'Jn 14,27',
    walking:
      'Estar en paz por un momento no significa amar menos ni olvidar. El duelo también puede tener pausas donde el corazón descansa.',
    smallStep: 'Quédate unos minutos con esta paz y agradece algo concreto de la vida de {{lovedOne}}.',
    prayer:
      'Gracias, Señor, por este momento de paz. Haz que pueda recibirlo como un regalo y seguir confiando a {{lovedOne}} a tu misericordia. Amén.',
  },
  hope: {
    intro: 'Hoy hay un poco más de luz. Recíbela.',
    scripture: '“La esperanza no defrauda.”',
    reference: 'Rom 5,5',
    walking:
      'La esperanza cristiana no niega la muerte ni el dolor. Nos permite caminar sabiendo que el amor de Dios es más grande que aquello que hoy no comprendemos.',
    smallStep: 'Piensa en una cosa pequeña de tu vida que hoy quieres volver a cuidar.',
    prayer:
      'Señor Jesús, conserva viva mi esperanza y enséñame a seguir caminando sin olvidar a {{lovedOne}}. Amén.',
  },
  gratitude: {
    intro: 'Hoy el recuerdo también puede convertirse en agradecimiento.',
    scripture: '“Doy gracias a mi Dios cada vez que los recuerdo.”',
    reference: 'cf. Flp 1,3',
    walking:
      'Agradecer no borra lo difícil. Significa reconocer que, en medio de la ausencia, hubo una vida y un amor que dejaron huellas.',
    smallStep: 'Nombra una cosa por la que hoy puedas decir: “Gracias por haberlo vivido”.',
    prayer:
      'Gracias, Señor, por todo el bien que recibí a través de {{lovedOne}}. Haz que ese bien siga dando fruto. Amén.',
  },
  confusion: {
    intro: 'No tienes que ordenar hoy todo lo que pasa dentro de ti.',
    scripture: '“Señor, Tú me sondeas y me conoces.”',
    reference: 'Sal 139',
    walking:
      'En algunos momentos las emociones llegan mezcladas o simplemente no tienen nombre. Podemos comenzar por el cuerpo y por lo que necesitas ahora.',
    smallStep: 'Pregúntate solamente: “¿Necesito descanso, silencio, compañía o oración?”.',
    prayer:
      'Señor, Tú conoces incluso aquello que yo no sé nombrar. Quédate conmigo mientras mi corazón encuentra palabras. Amén.',
  },
  unknown: {
    intro: 'Está bien no saber qué estás sintiendo.',
    scripture: '“El Espíritu viene en ayuda de nuestra debilidad.”',
    reference: 'Rom 8,26',
    walking:
      'No vamos a obligarte a poner una etiqueta. A veces basta con detenerse y reconocer cómo está el cuerpo: cansado, tenso, vacío o simplemente normal.',
    smallStep: 'No resuelvas nada durante un minuto. Solo respira y permanece aquí.',
    prayer:
      'Señor, cuando no sé qué decir ni qué siento, recibe también mi silencio. Amén.',
  },
};

const dayCopy: Partial<Record<number, AccompanimentCopy>> = {
  1: {
    intro: 'Hoy no tienes que entenderlo todo.',
    scripture: '“El Señor es mi pastor… aunque camine por valle oscuro.”',
    reference: 'Sal 23',
    walking:
      'Hay momentos para los que nadie está completamente preparado. Hoy no necesitas saber cómo será toda tu vida después de esto. Atravesar la siguiente hora puede ser suficiente.',
    smallStep: 'Siéntate unos minutos, respira lentamente y reconoce: “Esto me duele”.',
    prayer:
      'Señor Jesús, hoy no tengo muchas palabras. Recibe en tu misericordia a {{lovedOne}} y dame fuerza solamente para caminar este día. Amén.',
  },
  2: {
    intro: 'Puedes llorar.',
    scripture: '“Jesús lloró.”',
    reference: 'Jn 11,35',
    walking:
      'Las lágrimas no son ausencia de fe. A veces simplemente dicen que alguien significaba mucho para nosotros. Y si todavía no puedes llorar, tampoco significa que amabas menos.',
    smallStep: 'Si llegan lágrimas, no te apresures a detenerlas. Déjalas estar unos minutos.',
    prayer:
      'Jesús, Tú también lloraste. Entiende mis lágrimas y recibe con misericordia a {{lovedOne}}. Amén.',
  },
  3: {
    intro: 'Cuando todo parece irreal.',
    scripture: '“Dios es nuestro refugio y fortaleza.”',
    reference: 'Sal 46',
    walking:
      'La mente necesita tiempo para comprender una ausencia tan grande. No tienes que obligarte a sentir toda la realidad de lo ocurrido de una sola vez.',
    smallStep: 'Nombra tres cosas que ves, dos sonidos que escuchas y una sensación de tu cuerpo.',
    prayer:
      'Señor, hay momentos en que todavía me cuesta creerlo. Ten paciencia conmigo y quédate cerca. Amén.',
  },
  7: {
    intro: 'Hoy queremos recordar su vida, no solamente su muerte.',
    scripture: '“Te doy gracias cada vez que me acuerdo de ti.”',
    reference: 'cf. Flp 1,3',
    walking:
      'La historia de {{lovedOne}} fue mucho más grande que sus últimos días. Hubo una voz, costumbres, luchas, alegrías y amor compartido.',
    smallStep: 'Recuerda una escena cotidiana que no tenga nada que ver con su muerte.',
    prayer:
      'Gracias, Señor, por la vida de {{lovedOne}} y por todo lo bueno que dejó entre nosotros. Amén.',
  },
  9: {
    intro: 'Despedir no significa dejar de amar.',
    scripture: '“En la casa de mi Padre hay muchas moradas.”',
    reference: 'Jn 14,2',
    walking:
      'Nueve días no cierran una historia ni ponen fecha al duelo. Podemos reconocer la ausencia física y seguir confiando a quien amamos a la misericordia de Dios.',
    smallStep: 'Piensa en una enseñanza o virtud de {{lovedOne}} que deseas conservar viva.',
    prayer:
      'Señor Jesús, hoy volvemos a confiarte a {{lovedOne}}. Sostennos y mantén viva nuestra esperanza en la resurrección. Amén.',
  },
  30: {
    intro: 'Un mes: seguimos caminando.',
    scripture: '“Yo soy la resurrección y la vida.”',
    reference: 'Jn 11,25',
    walking:
      'No hay una forma correcta de llegar hasta aquí. Hoy no celebramos haber terminado una etapa; simplemente reconocemos que has seguido caminando.',
    smallStep: 'Completa: “Lo más difícil ha sido…”, “Lo que me ha ayudado…” y “Hoy necesito…”.',
    prayer:
      'Señor Jesús, enséñame que continuar viviendo no significa olvidar y sostén mi esperanza mientras confío a {{lovedOne}} a tu misericordia. Amén.',
  },
};

function replaceLovedOne(copy: AccompanimentCopy, lovedOneName: string) {
  const replace = (value: string) => value.replaceAll('{{lovedOne}}', lovedOneName);

  return {
    intro: replace(copy.intro),
    scripture: replace(copy.scripture),
    reference: replace(copy.reference),
    walking: replace(copy.walking),
    smallStep: replace(copy.smallStep),
    prayer: replace(copy.prayer),
  };
}

export function getAccompanimentCopy(
  decision: AccompanimentDecision,
  lovedOneName: string
): AccompanimentCopy {
  let copy = general;

  if (decision.focus === 'emotion' && decision.emotion) {
    copy = emotionCopy[decision.emotion] ?? general;
  } else if (decision.focus === 'time' && decision.daySinceLoss !== null) {
    copy = dayCopy[decision.daySinceLoss] ?? general;
  }

  return replaceLovedOne(copy, lovedOneName);
}
