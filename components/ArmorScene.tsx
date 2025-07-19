'use client'
import { useGLTF } from '@react-three/drei'

export function ArmorScene(props: any) {
    const { scene } = useGLTF('/models/sci-fi_armor.glb');
  return <primitive object={scene} {...props} />
}

  
