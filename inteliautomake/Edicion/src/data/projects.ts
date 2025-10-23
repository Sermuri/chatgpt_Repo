import { Music, Image as ImageIcon, Video } from 'lucide-react';

export const projects = [
  {
    icon: Music,
    title: 'Música con IA',
    description: 'Composiciones únicas generadas por IA',
    fullDescription: `La música generada por IA representa una revolución en la creación musical,
    combinando algoritmos avanzados con creatividad artificial.

    Capacidades:
    • Composición musical automática
    • Generación de melodías
    • Armonización inteligente
    • Creación de ritmos
    • Producción musical asistida

    Aplicaciones:
    • Música para contenido digital
    • Bandas sonoras personalizadas
    • Experimentación musical
    • Educación musical
    • Producción comercial`,
    media: {
      type: 'soundcloud',
      url: 'https://soundcloud.com/sergio-murillo-870692329/sets/ia-sounds-by-sergio-murillo'
    }
  },
  {
    icon: ImageIcon,
    title: 'Imágenes Generativas',
    description: 'Arte y diseño creado por IA',
    fullDescription: `La generación de imágenes por IA permite crear contenido visual único
    y personalizado para diferentes necesidades.

    Tipos de generación:
    • Ilustraciones originales
    • Modificación de imágenes
    • Diseño de logos
    • Arte conceptual
    • Fotografía sintética

    Usos:
    • Marketing digital
    • Diseño de productos
    • Contenido para redes sociales
    • Publicidad
    • Proyectos creativos`,
    media: {
      type: 'carousel',
      totalImages: 10
    }
  },
  {
    icon: Video,
    title: 'Video con IA',
    description: 'Contenido audiovisual generado por IA',
    fullDescription: `La producción de video con IA revoluciona la creación de contenido audiovisual,
    ofreciendo nuevas posibilidades creativas y de producción.

    Características:
    • Edición automática
    • Generación de animaciones
    • Efectos especiales
    • Subtitulado automático
    • Optimización de contenido

    Aplicaciones:
    • Marketing digital
    • Redes sociales
    • Educación en línea
    • Presentaciones corporativas
    • Entretenimiento`,
    media: {
      type: 'youtube',
      url: 'https://youtu.be/aV1dAqibLwc'
    }
  }
];