import dynamic from 'next/dynamic'
const Index = dynamic(
    () => import('@/pages/projects/index').then((mod) => mod.default)
)

function CreateProject() {
    return (
        <>
            <Index />
        </>
    )

}

export default CreateProject;
