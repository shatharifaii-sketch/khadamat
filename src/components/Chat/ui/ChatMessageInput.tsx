import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from '@/contexts/ChatContext';
import { Paperclip, SendHorizonal, X } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

interface Props {
    /**TODO: add reply to message */
    //replyToMessage: Message | null;
    //setReplyToMessage: React.Dispatch<React.SetStateAction<Message | null>>
    attachment?: string | null;
    setAttachment: React.Dispatch<React.SetStateAction<string | null>>
}

const ChatMessageInput = ({ attachment, setAttachment, /*replyToMessage, setReplyToMessage*/ }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewURL, setPreviewURL] = useState<string | null>(attachment || null);
    const [message, setMessage] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { sendMessage } = useChat();


    useEffect(() => {
        if (attachment) {
            setPreviewURL(attachment)
            console.log(attachment);
        } else {
            setPreviewURL(null)
        }
    }, [attachment])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setAttachment(URL.createObjectURL(selectedFile));
        setPreviewURL(URL.createObjectURL(selectedFile));
    }

    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    }

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim() === '') return;
        try {
            sendMessage({ content: message, file: file || attachment });
            setMessage('');
            setAttachment(null);
            setFile(null);
            setPreviewURL(null);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('حدث خطاء في ارسال الرسالة');
        }
    }

    return (
        <div className='flex flex-col items-center justify-center w-full gap-5 '>
            {/**TODO: add reply to message
            {
            replyToMessage && (
                <div className='min-w-[200px] relative max-w-[250px]'>
                    <Button onClick={() => {
                        setReplyToMessage(null);
                    }} className='absolute bg-red-500 rounded-full top-[-10px] right-[-10px] cursor-pointer text-white size-6 p-1' variant='destructive'>
                        <X className='size-5' />
                    </Button>
                    <p>
                        {replyToMessage.content}
                    </p>
                </div>
            )}
                 */}
            {previewURL && (
                <div className='min-w-[200px] relative max-w-[250px]'>
                    <Button onClick={() => {
                        setAttachment(null);
                        setFile(null);
                        setPreviewURL(null);
                    }} className='absolute bg-red-500 rounded-full top-[-10px] right-[-10px] cursor-pointer text-white size-6 p-1' variant='destructive'>
                        <X className='size-5' />
                    </Button>
                    <img src={previewURL} alt="image file" className='border rounded-md' />
                </div>
            )}
            <form className='flex w-full items-center gap-4' dir='ltr' onSubmit={handleSendMessage}>
                <div className='flex-1'>
                    <Input
                        type='text'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message" className='w-full' />
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        type='button'
                        onClick={handleOpenFilePicker}
                        variant={previewURL ? 'ghost' : 'outline'}
                        disabled={!!previewURL}
                    >
                        <Paperclip />
                    </Button>
                </div>
                <Button type='submit' variant='default'>
                    <SendHorizonal className='w-20 h-20' />
                    ارسال
                </Button>
            </form>
        </div>
    )
}

export default ChatMessageInput