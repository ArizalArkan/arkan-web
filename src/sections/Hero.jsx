import { PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'
// import { Leva, useControls } from 'leva'
import { useMediaQuery } from 'react-responsive'
import { calculateSizes } from '../constants'

// Component
import HackerRoom from '../components/HackerRoom'
import CanvasLoader from '../components/CanvasLoader'
import Target from '../components/Target'
import ReactLogo from '../components/ReactLogo'
import Cube from '../components/Cube'
import Ring from '../components/Ring'
import HeroCamera from '../components/HeroCamera'


const Hero = () => {
//   const x = useControls('HackerRoom', {
//     positionX: {
//         value: 2.5,
//         min: -10,
//         max: 10
//     },
//     positionY: {
//         value: 2.5,
//         min: -10,
//         max: 10
//     },
//     positionZ: {
//         value: 2.5,
//         min: -10,
//         max: 10
//     },
//     rotationX: {
//         value: 0,
//         min: -10,
//         max: 10
//     },
//     rotationY: {
//         value: 0,
//         min: -10,
//         max: 10
//     },
//     rotationZ: {
//         value: 0,
//         min: -10,
//         max: 10
//     },
//     scale: {
//         value: 0.12,
//         min: 0.1,
//         max: 10
//     }
// })
  const isTablet = useMediaQuery({minWidth: 768, maxWidth: 1024})
  const isMobile = useMediaQuery({maxWidth: 768})
  const isSmall = useMediaQuery({maxWidth: 440})

  const sizes = calculateSizes(isSmall, isMobile, isTablet)
  
  return (
    <section className="min-h-screen w-full flex flex-col relative">
      <div className="w-full mx-auto flex flex-col sm:mt-28 mt-24 c-space gap-3">
        <p className="sm:text-3xl text-2xl font-medium text-white text-center font-generalsans">
          Hi, I'am Arkan <span className="waving-hand">👋</span>
        </p>
        <p className="hero_tag text-gray_gradient">
          Crafting Digital Experience
        </p>
      </div>

      <div className="w-full h-full absolute inset-0">
        {/* <Leva/> */}
        <Canvas className="w-full h-full">
          <Suspense fallback={<CanvasLoader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 30]} />

            <HeroCamera isMobile={isMobile}>
              <HackerRoom
                scale={sizes.deskScale}
                position={sizes.deskPosition}
                rotation={[0, -Math.PI, 0]}
                // position={[x.positionX, x.positionY, x.positionZ]}
                // rotation={[x.rotationX, x.rotationY, x.rotationZ]}
              />
            </HeroCamera>
            <group>
              <Target position={sizes.targetPosition} />
              <ReactLogo position={sizes.reactLogoPosition} />
              <Cube position={sizes.cubePosition} />
              <Ring position={sizes.ringPosition} />
            </group>
            <ambientLight intensity={1} />
            <directionalLight position={[0, 0, 0]} intensity={0.5} />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}

export default Hero