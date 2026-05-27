import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import { ChevronDown, Edit, Trash } from 'lucide-react'
import React, { useState } from 'react'
import EditFAQmodals from './modals/EditFAQmodals'
import DeleteModal from '@common/components/CustomeDelete'
import { useCreateFAQ, useFAQs, useDeleteFAQMutation } from '@api-queries/super-admin/platform-settings/Query'
import { Spinner } from '@pages/components/ui/spinner'

const FAQpages = () => {
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteFAQ, setDeleteFAQ] = useState(false);
    const [selectedFAQId, setSelectedFAQId] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [openId, setOpenId] = useState(null);
    const { mutate, isPending, isSuccess, isError } = useCreateFAQ();
    const { mutate: deleteFAQMutate, isPending: isDeletePending } = useDeleteFAQMutation();
    const { data, isLoading } = useFAQs();

    const handleDeleteFAQ = async (id) => {
        try {
            await deleteFAQMutate(id);
            setDeleteFAQ(false);
            setSelectedFAQId(null);
        } catch (error) {
            console.error('Error deleting FAQ:', error);
        }
    };

    const handleAddFAQ = () => {
        if (!question || !answer) {
            console.log('Fill all fields');
            return;
        }
        mutate(
            {
                question,
                answer,
            },
            {
                onSuccess: () => {
                    // clear form after success
                    setQuestion('');
                    setAnswer('');
                },
            }
        );
    };
    if (isLoading) return <div className="w-full h-[300px] flex items-center justify-center">
        <p className='flex items-center justify-center'><Spinner /></p>;
    </div>

    return (
        <div className='flex flex-col  gap-5 py-3' >
            <div className="flex flex-col gap-5 p-4 rounded-lg space-y-4 shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
                <div className="w-[50%]">
                    <Input
                        label="FAQ Questions ?"
                        name="faq_questions"
                        type="text"
                        placeholder="Add FAQ questions"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                </div>
                <div className="w-[50%]">
                    <Input
                        label="FAQ Answers"
                        name="default_yearly_discount"
                        type="text"
                        placeholder="Add FAQ answers"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>

                <div className="">
                    <Button
                        size="addbutton"
                        onClick={handleAddFAQ}
                        disabled={isPending}
                    >
                        {isPending ? 'Adding...' : 'Add FAQ'}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-5 p-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
                {data?.map((faq) => {
                    const isOpen = openId === faq.id;

                    return (
                        <div
                            key={faq.id}
                            className="bg-white border rounded-xl px-4 py-2 flex flex-col gap-3"
                        >
                            {/* Question */}
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    setOpenId((prev) => (prev === faq.id ? null : faq.id))
                                }
                            >
                                <p className="text-base font-semibold text-gray-800">
                                    {faq.question}
                                </p>

                                <div
                                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                        }`}
                                >
                                    <ChevronDown />
                                </div>
                            </div>

                            {/* Answer */}
                            {isOpen && (
                                <div>
                                    <p className="text-sm text-gray-600">{faq.answer}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                                {/* <button onClick={() => setEditOpen(true)}>
                                    <Edit size={20} />
                                </button> */}

                                <button onClick={() => {
                                    setSelectedFAQId(faq.id);
                                    setDeleteFAQ(true);
                                }}>
                                    <Trash size={20} className="text-red" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <EditFAQmodals
                open={editOpen}
                setOpen={setEditOpen}
            />
            <DeleteModal
                open={deleteFAQ}
                setOpen={setDeleteFAQ}
                suspend={false}
                onConfirm={() => handleDeleteFAQ(selectedFAQId)}
                header={`Are you sure you want to delete this FAQ ?`}
                description={`This FAQ will be removed from your listing the center will lost this information ?`}
            />
        </div>
    )
}

export default FAQpages
