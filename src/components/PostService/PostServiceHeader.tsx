
interface PostServiceHeaderProps {
  children?: React.ReactNode;
  isEditMode?: boolean;
}

const PostServiceHeader = ({ children, isEditMode }: PostServiceHeaderProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {isEditMode ? 'تعديل الخدمة' : 'انشر خدمتك'}
      </h1>
      <p className="text-xl text-muted-foreground mb-6">
        ابدأ في كسب المال من خلال تقديم خدماتك المهنية
      </p>
      {children}
    </div>
  );
};

export default PostServiceHeader;
