type CreateWebsitePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const CreateWebsitePage = async ({ params }: CreateWebsitePageProps) => {
  const { slug } = await params;

  return <div>{slug}</div>;
};

export default CreateWebsitePage;