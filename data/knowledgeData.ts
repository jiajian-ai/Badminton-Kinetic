import { Zap, Activity, Footprints, Move3d, Crosshair, TrendingUp } from "lucide-react";
import { KnowledgeItem } from "../types";

export const knowledgeData: KnowledgeItem[] = [
  {
    id: '1',
    title: '动力链',
    subtitle: 'Kinetic Chain',
    description: '力量从脚底蹬地开始，经由髋关节旋转、躯干传递，最终到达手腕手指的逐级放大过程。核心在于"鞭打效应"。',
    icon: Zap,
    tags: [{ label: '核心原理' }, { label: '发力' }],
    size: 'large',
    difficulty: 'Advanced'
  },
  {
    id: '2',
    title: '蹬地原理',
    subtitle: 'Push-off Mechanics',
    description: '利用地面反作用力（GRF）。起动时非持拍脚的前脚掌瞬间爆发蹬地，为身体提供向前的初速度。',
    icon: Footprints,
    tags: [{ label: '步法' }, { label: '爆发力' }],
    size: 'medium',
    difficulty: 'Basic'
  },
  {
    id: '3',
    title: '分腿垫步',
    subtitle: 'Split Step',
    description: '在对手击球瞬间做出的轻微跳跃动作。利用肌肉的牵张反射（SSC）像弹簧一样蓄能，实现全方位快速启动。',
    icon: Move3d,
    tags: [{ label: '步法' }, { label: '时机' }],
    size: 'medium',
    difficulty: 'Intermediate'
  },
  {
    id: '4',
    title: '内旋/外旋',
    subtitle: 'Pronation / Supination',
    description: '前臂尺骨与桡骨的旋转运动。这是杀球和反手高远球最后"闪腕"发力的解剖学基础。',
    icon: Activity,
    tags: [{ label: '解剖学' }, { label: '技巧' }],
    size: 'tall',
    difficulty: 'Advanced'
  },
  {
    id: '5',
    title: '重心控制',
    subtitle: 'Center of Gravity',
    description: '保持重心在两脚之间偏前位置。击球后迅速回中，利用髋关节的折叠降低重心来制动。',
    icon: Crosshair,
    tags: [{ label: '稳定性' }],
    size: 'medium',
    difficulty: 'Intermediate'
  },
  {
    id: '6',
    title: '手指发力',
    subtitle: 'Finger Power',
    description: '依靠食指和拇指的捻动控制拍面角度，后三指的瞬间握紧提供最后的加速力。',
    icon: TrendingUp,
    tags: [{ label: '微操' }],
    size: 'medium',
    difficulty: 'Advanced'
  }
];