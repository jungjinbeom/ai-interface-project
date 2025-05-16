import ChatContainer from './components/ChatContainer';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">채팅 인터페이스</h1>
                <ChatContainer />
            </div>
        </div>
    );
}

export default App;
