import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../../Components/Hooks/useAuth';
import AxiosSecure from '../../Components/Hooks/AxiosSecure';

const SentBox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const axiosInstance = AxiosSecure();

  const [expandedSendId, setExpandedSendId] = useState(null);
  const [sendMessage, setSendMessage] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    if (user?.email) {
      axiosInstance
        .get(`/user-send/message/${user.email}?page=${page}&limit=${limit}`)
        .then((res) => {
          setSendMessage(res.data.messages || []);
          setTotalMessages(res.data.total || 0);
        })
        .catch((err) => console.error('Error fetching sent messages:', err));
    }
  }, [user?.email, page, limit, axiosInstance]);

  const totalPages = Math.ceil(totalMessages / limit);

  // Helper to normalize attachments (single or array; different url keys)
  const getAttachments = (msg) => {
    if (Array.isArray(msg?.attachments)) return msg.attachments;
    if (msg?.attachment) return [msg.attachment];
    return [];
  };

  const getAttachmentUrl = (a) => a?.path || a?.firebaseUrl || a?.url || '';
  const getAttachmentName = (a) => a?.filename || a?.originalname || 'attachment';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-prime">Sent Box 📤</h2>
          <p className="text-sm text-gray-500">Logged in as: {user?.email}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/send-message')}
          className="md:btn btn-sm p-2 bg-prime text-black shadow-sm hover:shadow-md transition"
        >
          Send New Message
        </button>
      </div>

      <div className="overflow-x-auto border border-prime rounded-xl">
        <table className="table w-full">
          <thead className="bg-prime text-white text-sm">
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sendMessage.length > 0 ? (
              sendMessage.map((msg) => {
                const attachments = getAttachments(msg);
                return (
                  <React.Fragment key={msg._id}>
                    <tr
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() =>
                        setExpandedSendId(expandedSendId === msg._id ? null : msg._id)
                      }
                    >
                      <td>
                        {Array.isArray(msg.recipients)
                          ? msg.recipients.join(', ')
                          : 'No recipients'}
                      </td>
                      <td>{msg.subject}</td>
                      <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                    </tr>

                    {expandedSendId === msg._id && (
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="p-4">
                          <div className="space-y-3 text-gray-800">
                            <div>
                              <strong>Description:</strong> {msg.description}
                            </div>

                            {attachments.length > 0 && (
                              <div>
                                <strong>Attachment{attachments.length > 1 ? 's' : ''}:</strong>
                                <ul className="mt-2 space-y-2">
                                  {attachments.map((a, i) => {
                                    const url = getAttachmentUrl(a);
                                    const name = getAttachmentName(a);
                                    const type = a?.mimetype || '';
                                    return (
                                      <li key={i} className="flex items-center gap-3">
                                        <span className="inline-block rounded px-2 py-0.5 text-xs bg-blue-100 text-blue-700">
                                          {type || 'file'}
                                        </span>
                                        {url ? (
                                          <>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="link link-primary break-all"
                                              title={name}
                                            >
                                              {name}
                                            </a>
                                            <a
                                              href={url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="btn btn-xs btn-outline"
                                              download
                                            >
                                              Download
                                            </a>
                                          </>
                                        ) : (
                                          <span className="text-gray-500">No URL available</span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No sent messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setPage(idx + 1)}
              className={`btn btn-sm ${page === idx + 1 ? 'btn-primary' : 'btn-outline'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SentBox;
