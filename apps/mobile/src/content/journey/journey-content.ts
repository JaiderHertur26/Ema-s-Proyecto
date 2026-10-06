import type { JourneyStageId } from '@/domain/journey-path';

export type JourneyStageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  scripture: string;
  reference: string;
  reflection: string;
  smallStep: string;
  prayer: string;
};

export const journeyStageContent: Record<JourneyStageId, JourneyStageContent> = {
  first_days: {
    eyebrow: 'PRIMEROS DÍAS',
    title: 'Hoy no tienes que entenderlo todo',
    intro:
      'Los primeros días pueden sentirse confusos, intensos o incluso irreales. EMAÚS no te pedirá que entiendas ahora lo que tu corazón todavía está intentando recibir.',
    scripture: '“Aunque camine por valle oscuro, nada temo, porque Tú vas conmigo.”',
    reference: 'Sal 23',
    reflection:
      'Hay momentos en que caminar significa atravesar solamente la siguiente hora. No necesitas imaginar hoy cómo será toda tu vida después de esta pérdida. Puedes llorar, guardar silencio, pedir ayuda o simplemente reconocer que esto te duele. La fe no exige que escondas tu fragilidad.',
    smallStep:
      'Busca un lugar donde puedas sentarte unos minutos. Respira lentamente y di con sinceridad: “Señor, esto me duele”.',
    prayer:
      'Señor Jesús, no tengo que comprenderlo todo hoy. Quédate conmigo, recibe a {{name}} en tu misericordia y dame fuerza para caminar este día. Amén.',
  },
  funeral: {
    eyebrow: 'EXEQUIAS',
    title: 'Despedir con fe',
    intro:
      'La celebración de las exequias reconoce con verdad la muerte y, al mismo tiempo, proclama la esperanza cristiana en la resurrección.',
    scripture: '“Yo soy la resurrección y la vida.”',
    reference: 'Jn 11,25',
    reflection:
      'Despedir el cuerpo de quien amamos no significa borrar su historia ni dejar de amar. La Iglesia ora, acompaña y confía a los difuntos a la misericordia de Dios. Puedes vivir este momento con lágrimas, preguntas y también con esperanza. No necesitas elegir entre dolor y fe: ambos pueden habitar el mismo corazón.',
    smallStep:
      'Si participas o participaste en las exequias, elige una palabra de la celebración que quieras conservar: misericordia, descanso, esperanza, resurrección o gratitud.',
    prayer:
      'Señor Jesús, recibe nuestra oración por {{name}}. Consuela a quienes lloramos su partida y sostennos en la esperanza de la resurrección. Amén.',
  },
  nine_days: {
    eyebrow: 'NUEVE DÍAS',
    title: 'Orar y recordar',
    intro:
      'En muchas familias católicas estos días se convierten en un tiempo especial de oración, compañía y memoria.',
    scripture: '“En la casa de mi Padre hay muchas moradas.”',
    reference: 'Jn 14,2',
    reflection:
      'Nueve días no cierran una historia ni ponen límite al duelo. Son una oportunidad para volver a confiar a {{name}} a la misericordia de Dios y para permitir que la familia recuerde su vida. El amor recibido no desaparece porque la presencia física haya cambiado.',
    smallStep:
      'Piensa en una virtud, gesto o enseñanza de {{name}} que quisieras conservar viva en tu manera de vivir.',
    prayer:
      'Señor Jesús, volvemos a confiarte a {{name}}. Recibe nuestra oración, acompaña a nuestra familia y mantén viva en nosotros la esperanza. Amén.',
  },
  first_month: {
    eyebrow: 'PRIMER MES',
    title: 'Seguir caminando',
    intro:
      'Alrededor del primer mes algunas ayudas iniciales disminuyen y la ausencia puede sentirse de una manera nueva.',
    scripture: '“Yo estoy con ustedes todos los días.”',
    reference: 'Mt 28,20',
    reflection:
      'No hay una forma correcta de llegar al primer mes. Tal vez sientes que ha pasado muchísimo tiempo o que todo ocurrió ayer. Quizá algunas cosas empiezan a organizarse y otras duelen incluso más. Nada de eso significa que estés haciendo mal el duelo. Has seguido caminando, y eso basta por hoy.',
    smallStep:
      'Completa tres frases: “Lo más difícil ha sido…”, “Lo que me ha ayudado…” y “Hoy necesito…”.',
    prayer:
      'Señor Jesús, el tiempo avanza y mi corazón sigue aprendiendo a vivir esta ausencia. Recibe a {{name}} en tu misericordia y enséñame a seguir caminando sin olvidar. Amén.',
  },
  following_months: {
    eyebrow: 'MESES SIGUIENTES',
    title: 'Aprender a vivir con la ausencia',
    intro:
      'Con el paso de los meses el duelo puede cambiar de forma. No siempre se vuelve simplemente más fácil; muchas veces se vuelve diferente.',
    scripture: '“Para todo hay un momento.”',
    reference: 'Ecl 3,1',
    reflection:
      'Pueden aparecer días tranquilos y otros en que un recuerdo devuelve el dolor con mucha fuerza. La vida cotidiana empieza a pedir espacio otra vez: trabajo, familia, decisiones, descanso, alegría. Volver a vivir no es abandonar a quien murió. Es permitir que su recuerdo encuentre un lugar dentro de una historia que continúa.',
    smallStep:
      'Pregúntate qué parte de tu propia vida necesita hoy un poco más de cuidado: cuerpo, familia, trabajo, descanso, amistad o fe.',
    prayer:
      'Señor, enséñame a integrar esta ausencia sin quedar detenido en ella. Que lo bueno que recibí de {{name}} siga dando fruto en mi vida. Amén.',
  },
  special_dates: {
    eyebrow: 'FECHAS IMPORTANTES',
    title: 'Cuando una fecha vuelve a tocar el corazón',
    intro:
      'Cumpleaños, Navidad, aniversarios, celebraciones familiares o días muy personales pueden hacer que la ausencia se sienta de nuevo con intensidad.',
    scripture: '“María conservaba todas estas cosas en su corazón.”',
    reference: 'Lc 2,19',
    reflection:
      'EMAÚS no asumirá que una fecha será necesariamente triste. Puede ser dolorosa, serena, agradecida o mezclar muchas emociones. Tampoco existe un ritual único que debas cumplir. Puedes rezar, ir a Misa, visitar un lugar, compartir una comida, mirar fotografías o continuar tu rutina.',
    smallStep:
      'Elige cómo quieres vivir la próxima fecha importante para ti. No lo que otros esperan: lo que realmente te ayude.',
    prayer:
      'Señor Jesús, acompáñame en las fechas que tocan especialmente mi memoria. Que pueda recordar a {{name}} con libertad, gratitud y esperanza. Amén.',
  },
  first_anniversary: {
    eyebrow: 'PRIMER ANIVERSARIO',
    title: 'Memoria y esperanza',
    intro:
      'Acercarse al primer aniversario puede despertar recuerdos muy vivos del tiempo que rodeó la partida.',
    scripture: '“La esperanza no defrauda.”',
    reference: 'Rom 5,5',
    reflection:
      'Un año no significa que el duelo tenga que estar terminado. Tampoco significa que todo deba doler igual que al principio. Puedes mirar lo recorrido sin convertirlo en una evaluación. Has vivido días muy distintos y has ido encontrando formas nuevas de llevar contigo lo que esa persona significó.',
    smallStep:
      'Escribe una cosa que haya cambiado en ti durante este año y una cosa de {{name}} que quieras seguir llevando contigo.',
    prayer:
      'Señor Jesús, al recordar este primer año, recibe mi gratitud, mis lágrimas y todo lo que todavía necesita tiempo. Confío nuevamente a {{name}} a tu misericordia. Amén.',
  },
  after_first_year: {
    eyebrow: 'DESPUÉS DEL PRIMER AÑO',
    title: 'La vida continúa, el amor permanece',
    intro:
      'Después del primer año el duelo no desaparece por calendario. Puede integrarse cada vez más en la vida cotidiana sin dejar de tener momentos sensibles.',
    scripture: '“Yo he venido para que tengan vida.”',
    reference: 'Jn 10,10',
    reflection:
      'Seguir viviendo plenamente no significa olvidar. Puedes construir proyectos, volver a reír, amar, descansar y crecer sin traicionar la historia compartida. La memoria sana no exige que la ausencia ocupe todo el espacio. Puede convertirse en gratitud, legado y una forma más profunda de amar la vida que todavía tienes.',
    smallStep:
      'Piensa en algo que hoy quieres construir, cuidar o retomar en tu propia vida.',
    prayer:
      'Señor, gracias por todo lo vivido con {{name}}. Ayúdame a honrar esa historia viviendo con fe, libertad, gratitud y esperanza. Amén.',
  },
};

export function personalizeJourneyContent(stageId: JourneyStageId, name: string) {
  const source = journeyStageContent[stageId];
  const replace = (value: string) => value.replaceAll('{{name}}', name);

  return {
    ...source,
    intro: replace(source.intro),
    reflection: replace(source.reflection),
    smallStep: replace(source.smallStep),
    prayer: replace(source.prayer),
  };
}
