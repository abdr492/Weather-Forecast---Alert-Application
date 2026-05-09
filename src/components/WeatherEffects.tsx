import React from 'react';
import { motion } from 'framer-motion';

interface WeatherEffectsProps {
  code: number;
  isDay?: boolean;
}

const WeatherEffects: React.FC<WeatherEffectsProps> = ({ code, isDay = true }) => {
  // WMO Weather interpretation codes
  const isRain = (code >= 51 && code <= 65) || (code >= 80 && code <= 82);
  const isSnow = (code >= 71 && code <= 77);
  const isThunder = (code >= 95 && code <= 99);
  const isCloudy = (code >= 1 && code <= 3);
  const isFog = (code === 45 || code === 48);
  const isClear = code === 0;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {/* Night Sky / Stars */}
      {!isDay && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: Math.random() }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity, 
                delay: Math.random() * 5 
              }}
              className="absolute w-[1px] h-[1px] bg-white rounded-full"
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%` 
              }}
            />
          ))}
          {isClear && (
            <motion.div 
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400 rounded-full blur-[60px]"
            />
          )}
        </div>
      )}

      {/* Fog/Mist Effect */}
      {isFog && (
        <motion.div 
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            x: [-10, 10, -10]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white/20 blur-[60px]"
        />
      )}
      {/* Rain Effect */}
      {isRain && (
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: -20, left: `${Math.random() * 100}%`, opacity: 0.1 }}
              animate={{ 
                top: '120%', 
                opacity: [0, 0.4, 0],
              }}
              transition={{ 
                duration: 0.5 + Math.random() * 0.5, 
                repeat: Infinity, 
                delay: Math.random() * 2,
                ease: "linear"
              }}
              className="absolute w-[1px] h-4 bg-blue-400"
            />
          ))}
        </div>
      )}

      {/* Snow Effect */}
      {isSnow && (
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: -20, left: `${Math.random() * 100}%`, opacity: 0.1 }}
              animate={{ 
                top: '120%', 
                left: `${(Math.random() * 100) + (Math.random() * 10 - 5)}%`,
                opacity: [0, 0.6, 0],
                rotate: 360
              }}
              transition={{ 
                duration: 3 + Math.random() * 4, 
                repeat: Infinity, 
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}

      {/* Thunder Effect */}
      {isThunder && (
        <>
          <motion.div 
            animate={{ opacity: [0, 0.1, 0, 0.2, 0] }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 + Math.random() * 5 
            }}
            className="absolute inset-0 bg-purple-400"
          />
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={{ top: -20, left: `${Math.random() * 100}%`, opacity: 0.1 }}
                 animate={{ top: '120%' }}
                 transition={{ duration: 0.4, repeat: Infinity, delay: Math.random() * 2 }}
                 className="absolute w-[1.5px] h-6 bg-blue-300 opacity-20"
               />
            ))}
          </div>
        </>
      )}

      {/* Clear/Sun Glow and Rays */}
      {isClear && isDay && (
        <>
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 -right-20 w-64 h-64 bg-yellow-500 rounded-full blur-[80px]"
          />
          {/* Subtle Sun Rays */}
          <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-0 right-0 w-[1px] h-[150px] bg-gradient-to-b from-yellow-400/20 to-transparent origin-top"
                style={{ 
                  transform: `rotate(${i * 30 + 15}deg) translateX(0px)`,
                  top: '0px',
                  right: '0px'
                }}
                animate={{ 
                  opacity: [0, 0.5, 0],
                  scaleY: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: "easeInOut" 
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Cloudy Drift */}
      {isCloudy && (
        <div className="absolute inset-0 opacity-10">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              initial={{ left: '-20%', top: `${20 + i * 20}%` }}
              animate={{ left: '120%' }}
              transition={{ 
                duration: 20 + Math.random() * 10, 
                repeat: Infinity, 
                delay: i * 5,
                ease: "linear"
              }}
              className="absolute w-32 h-16 bg-white blur-[40px] rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherEffects;
