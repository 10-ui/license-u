import { useState } from 'react';
import Header from '@/components/common/header';
import ShobiButtons from '@/components/common/shobibuttons';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header />
      <main className='p-4'>
        <h2 className='text-xl font-bold'>shobi-u</h2>

        <ShobiButtons />
      </main>
    </>
  );
}

export default App;
