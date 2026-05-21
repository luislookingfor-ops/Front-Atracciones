import { motion } from 'framer-motion';
import { Clock, CheckCircle, PlusCircle, MapPin } from 'lucide-react';

/**
 * InteractiveItinerary — Animated vertical timeline
 * Props:
 *   stops: [{ order, title, description, duration, type: 'included'|'optional', location? }]
 */
const InteractiveItinerary = ({ stops = [] }) => {
  if (!stops.length) return null;

  const typeConfig = {
    included: {
      label: 'Incluido',
      color: 'bg-ocean-500',
      textColor: 'text-ocean-600',
      icon: CheckCircle,
      badgeBg: 'bg-ocean-50 text-ocean-700',
    },
    optional: {
      label: 'Opcional',
      color: 'bg-sand-400',
      textColor: 'text-sand-500',
      icon: PlusCircle,
      badgeBg: 'bg-sand-100 text-sand-600',
    },
  };

  const totalDuration = stops.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-sand-400 text-xs uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          <span>Duración total: {totalDuration} min</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ocean-500 inline-block" /> Incluido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sand-400 inline-block" /> Opcional
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-sand-200" />

        <div className="space-y-0">
          {stops.map((stop, i) => {
            const config = typeConfig[stop.type] || typeConfig.included;
            const Icon = config.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="relative flex gap-6 pb-8 last:pb-0"
              >
                {/* Node */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-xs font-bold">
                      {String(stop.order || i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white border border-sand-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h4
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      className="text-lg font-medium text-sand-950 group-hover:text-ocean-700 transition-colors"
                    >
                      {stop.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 font-medium ${config.badgeBg}`}>
                        <Icon className="w-3 h-3 inline mr-1" />
                        {config.label}
                      </span>
                      {stop.duration && (
                        <span className="text-[10px] uppercase tracking-widest text-sand-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {stop.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                  {stop.description && (
                    <p className="text-sm text-sand-600 leading-relaxed font-light">{stop.description}</p>
                  )}
                  {stop.location && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-sand-400">
                      <MapPin className="w-3 h-3" />
                      <span className="italic">{stop.location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InteractiveItinerary;
