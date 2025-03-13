import { PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense, useEffect, useRef } from 'react'
import gsap from 'gsap';
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
import Button from '../components/Button';


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

  const textRef = useRef(null);
  const languages = ["안녕하세요", "こんにちは", "Hola", "Hi", "Bonjour", "Hai"];

  useEffect(() => {
    let ctx = gsap.context(() => {
      let i = 0;

      gsap.to({}, {
        duration: 2,
        repeat: -1,
        onRepeat: () => {
          gsap.to(textRef.current, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              textRef.current.innerText = languages[i];
              gsap.to(textRef.current, {
                opacity: 1,
                duration: 0.5,
              });
              i = (i + 1) % languages.length;
            },
          });
        },
      });
    });

    return () => ctx.revert(); // Cleanup on component unmount
  }, []);
  
  return (
    <section className="min-h-screen w-full flex flex-col relative">
      <div className="w-full mx-auto flex flex-col sm:mt-28 mt-24 c-space gap-3">
        <p className="sm:text-3xl text-2xl font-medium text-white text-center font-generalsans">
        <span className='font-instrument italic' ref={textRef}>Hi</span>, <span className='font-manrope'>I'am Arkan</span> <span className="waving-hand">👋</span>
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
      <div className='absolute bottom-7 left-0 w-full z-10 c-space'>
        <a href="#contact" className='w-fit'>
          <Button name="Let’s create something amazing together!" isBeam containerClass='sm:w-fit w-full sm:min-w-96' />
        </a>
      </div>
    </section>
  );
}

export default Hero