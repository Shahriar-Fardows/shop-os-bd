"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiPlus, FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';
import useAxios from '@/hooks/useAxios';
import Swal from 'sweetalert2';

export default function SupportPage() {
    const api = useAxios();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const chatEndRef = useRef(null);
    const audioRef = useRef(null);

    const fetchTickets = useCallback(async () => {
        try {
            const res = await api.get('/support/my-tickets');
            setTickets(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
        }
    }, [api]);

    const fetchTicketDetails = useCallback(async (id, silent = false) => {
        try {
            const res = await api.get(`/support/${id}`);
            const updatedTicket = res.data.data;
            
            if (selectedTicket && selectedTicket._id === id) {
                // Check if new messages arrived
                if (updatedTicket.messages.length > selectedTicket.messages.length) {
                    const lastMsg = updatedTicket.messages[updatedTicket.messages.length - 1];
                    if (lastMsg.senderModel === 'Admin') {
                        if (audioRef.current) audioRef.current.play().catch(e => {});
                    }
                    setSelectedTicket(updatedTicket);
                }
            } else if (!selectedTicket && !silent) {
                setSelectedTicket(updatedTicket);
            }
        } catch (error) {
            console.error('Error fetching ticket details:', error);
        }
    }, [api, selectedTicket]);

    // Polling effect
    useEffect(() => {
        fetchTickets();
        const interval = setInterval(() => {
            fetchTickets();
            if (selectedTicket) {
                fetchTicketDetails(selectedTicket._id, true);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [fetchTickets, fetchTicketDetails, selectedTicket]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedTicket?.messages]);

    const handleCreateTicket = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Open New Support Ticket',
            html: `
                <div class="flex flex-col gap-3 text-left font-nunito">
                    <label class="text-xs font-bold text-gray-400">Issue Subject</label>
                    <input id="swal-subject" class="swal2-input !m-0 !w-full" style="border-radius: 8px" placeholder="e.g. Payment Issue">
                    <label class="text-xs font-bold text-gray-400">Describe your problem</label>
                    <textarea id="swal-message" class="swal2-textarea !m-0 !w-full" style="border-radius: 8px" placeholder="Explain details..."></textarea>
                </div>
            `,
            confirmButtonText: 'Submit Ticket',
            confirmButtonColor: '#1e6bd6',
            showCancelButton: true,
            preConfirm: () => {
                return {
                    subject: document.getElementById('swal-subject').value,
                    message: document.getElementById('swal-message').value
                }
            }
        });

        if (formValues) {
            try {
                await api.post('/support/create', formValues);
                fetchTickets();
            } catch (error) {
                Swal.fire('Error', 'Failed to create ticket', 'error');
            }
        }
    };

    const handleSelectTicket = async (ticket) => {
        setLoading(true);
        await fetchTicketDetails(ticket._id);
        setLoading(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedTicket) return;

        try {
            const res = await api.post(`/support/message/${selectedTicket._id}`, { text: message });
            setSelectedTicket(res.data.data);
            setMessage('');
        } catch (error) {
            Swal.fire('Error', 'Failed to send message', 'error');
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 font-nunito">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3" />
            
            <div className="w-80 bg-white border border-gray-100 rounded-lg flex flex-col shadow-sm">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-gray-800 tracking-tight">Support Center</h2>
                        <button onClick={handleCreateTicket} className="p-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-all">
                            <FiPlus size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {tickets.map((t) => (
                        <div 
                            key={t._id} 
                            onClick={() => handleSelectTicket(t)}
                            className={`p-5 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${selectedTicket?._id === t._id ? 'bg-blue-50/50 border-r-4 border-r-brand' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`text-sm font-bold truncate pr-2 ${selectedTicket?._id === t._id ? 'text-brand' : 'text-gray-800'}`}>{t.subject}</h3>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg uppercase border ${
                                    t.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                    {t.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-widest text-[9px]">
                                <FiClock size={10} />
                                <span>Updated: {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white border border-gray-100 rounded-lg flex flex-col shadow-sm">
                {selectedTicket ? (
                    <>
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-800 tracking-tight">{selectedTicket.subject}</h2>
                                <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-widest leading-none italic">Session active (Autosync enabled)</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/10">
                            {selectedTicket.messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.senderModel === 'Client' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%]`}>
                                        <div className={`p-4 rounded-lg text-sm shadow-sm ${
                                            msg.senderModel === 'Client' 
                                            ? 'bg-brand text-white rounded-br-none' 
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-bl-none shadow-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest text-gray-300 ${msg.senderModel === 'Client' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-6 border-t border-gray-50">
                            {selectedTicket.status === 'open' ? (
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm focus:border-brand outline-none transition-all font-medium"
                                    />
                                    <button type="submit" className="bg-brand text-white px-6 rounded-lg hover:bg-brand-hover transition-all flex items-center justify-center shadow-lg shadow-blue-50">
                                        <FiSend size={18} />
                                    </button>
                                </form>
                            ) : (
                                <div className="p-4 bg-gray-50 text-center rounded-lg border border-gray-100 italic text-gray-400 text-sm font-bold uppercase tracking-widest">
                                    This ticket is closed and no longer accepts messages.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                            <FiMessageSquare size={40} />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">Select a ticket to begin chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
