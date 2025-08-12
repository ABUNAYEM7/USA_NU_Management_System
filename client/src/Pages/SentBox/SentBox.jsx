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
              sendMessage.map((msg) => (
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
                      <td colSpan="3" className="p-4">
                        <div className="text-gray-800">
                          <strong>Description:</strong> {msg.description}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-8 text-gray-500">
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
