
interface PostServiceHeaderProps {
  children?: React.ReactNode;
}

const PostServiceHeader = ({ children }: PostServiceHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        انشر خدمتك المهنية
      </h1>
      <p className="text-xl text-muted-foreground mb-6">
        ابدأ في كسب المال من خلال تقديم خدماتك المهنية
      </p>
      {children}
    </div>
  );
};

export default PostServiceHeader;
