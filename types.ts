import { LucideIcon } from "lucide-react";

export interface Tag {
  label: string;
  color?: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  tags: Tag[];
  size?: 'small' | 'medium' | 'large' | 'tall'; // For Bento Grid layout
  difficulty: 'Basic' | 'Intermediate' | 'Advanced';
}