import ProjectDetail from '@/components/ProjectDetail';

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  return <ProjectDetail projectId={params.projectId} />;
}
