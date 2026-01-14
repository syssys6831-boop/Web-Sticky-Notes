
import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebaseConfig';
import firebase from 'firebase/compat/app';
import { Note, StoredFile, TimeBoxData, Todo } from '../types';

export const NOTE_COLORS = [
  'bg-amber-200 text-amber-900',
  'bg-sky-200 text-sky-900',
  'bg-emerald-200 text-emerald-900',
  'bg-rose-200 text-rose-900',
  'bg-violet-200 text-violet-900',
];

export const HIGHLIGHTER_COLORS = [
  { name: 'None', class: '' },
  { name: 'Yellow', class: 'bg-yellow-100/80' },
  { name: 'Pink', class: 'bg-rose-100/80' },
  { name: 'Blue', class: 'bg-sky-100/80' },
  { name: 'Green', class: 'bg-emerald-100/80' },
];

const getLocalDateString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useFirestoreNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [timeBox, setTimeBox] = useState<TimeBoxData | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todayStr, setTodayStr] = useState(getLocalDateString());
  const [todoBoxPos, setTodoBoxPos] = useState({ x: 50, y: 150 });
  const [todoBoxSize, setTodoBoxSize] = useState({ height: 500 });

  // Keep track of current timeBox state to access inside callbacks without dependencies
  const timeBoxRef = useRef<TimeBoxData | null>(null);
  useEffect(() => {
    timeBoxRef.current = timeBox;
  }, [timeBox]);

  // Update todayStr at midnight
  useEffect(() => {
    const timer = setInterval(() => {
      const nowStr = getLocalDateString();
      if (nowStr !== todayStr) setTodayStr(nowStr);
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, [todayStr]);

  // Unified Subscription for Settings
  useEffect(() => {
    const unsubscribe = db.collection('settings').doc('todoBox').onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data?.position) setTodoBoxPos(data.position);
        if (data?.size) setTodoBoxSize(data.size);
      }
    });
    return () => unsubscribe();
  }, []);

  // Notes Subscription
  useEffect(() => {
    const unsubscribe = db.collection('notes')
      .orderBy('lastEdited', 'desc')
      .onSnapshot((snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note)));
      });
    return () => unsubscribe();
  }, []);

  // Files Subscription
  useEffect(() => {
    const unsubscribe = db.collection('files')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        setFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredFile)));
      });
    return () => unsubscribe();
  }, []);

  // TimeBox Subscription
  useEffect(() => {
    const unsubscribe = db.collection('timeboxes').doc(todayStr).onSnapshot((docSnap) => {
      if (docSnap.exists) {
        const data = docSnap.data();
        setTimeBox({ 
            id: docSnap.id, 
            entries: data?.entries || {}, 
            colors: data?.colors || {}, 
            position: data?.position 
        } as TimeBoxData);
      } else {
        setTimeBox({ id: todayStr, entries: {}, colors: {}, position: { x: window.innerWidth - 600, y: 100 } });
      }
    });
    return () => unsubscribe();
  }, [todayStr]);

  // Todo List Subscription
  useEffect(() => {
    const unsubscribe = db.collection('todos').orderBy('order', 'asc').onSnapshot(async (snapshot) => {
      const allTodos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
      const rolloverBatch = db.batch();
      let hasChanges = false;

      allTodos.forEach(todo => {
        if (todo.lastDate !== todayStr) {
          if (todo.fixed) {
            const todoRef = db.collection('todos').doc(todo.id);
            rolloverBatch.update(todoRef, { completed: false, lastDate: todayStr });
            hasChanges = true;
          } else if (!todo.completed) {
            const todoRef = db.collection('todos').doc(todo.id);
            rolloverBatch.update(todoRef, { lastDate: todayStr });
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        await rolloverBatch.commit();
      } else {
        const currentTodos = allTodos.filter(t => t.lastDate === todayStr || t.fixed);
        
        const sortedTodos = [...currentTodos].sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          return (a.order || 0) - (b.order || 0);
        });
        
        setTodos(sortedTodos);
      }
    });
    return () => unsubscribe();
  }, [todayStr]);

  const addTodo = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // Find the minimum order among current todos to place the new one at the top
    const allOrders = todos.map(t => t.order || 0);
    const minOrder = allOrders.length > 0 ? Math.min(...allOrders) : 0;
    
    await db.collection('todos').add({
      text,
      completed: false,
      fixed: false,
      lastDate: todayStr,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      order: minOrder - 1
    });
  }, [todayStr, todos]);

  const toggleTodo = useCallback((id: string, completed: boolean) => 
    db.collection('todos').doc(id).update({ completed }), []);
  
  const toggleFixedTodo = useCallback((id: string, fixed: boolean) => 
    db.collection('todos').doc(id).update({ fixed }), []);
  
  const deleteTodo = useCallback((id: string) => 
    db.collection('todos').doc(id).delete(), []);

  const updateTodoPosition = useCallback((pos: { x: number, y: number }) => 
    db.collection('settings').doc('todoBox').set({ position: pos }, { merge: true }), []);
  
  const updateTodoBoxSize = useCallback((size: { height: number }) => 
    db.collection('settings').doc('todoBox').set({ size }, { merge: true }), []);

  const updateTodoOrder = useCallback(async (reorderedTodos: Todo[]) => {
    const batch = db.batch();
    reorderedTodos.forEach((todo, index) => {
      const todoRef = db.collection('todos').doc(todo.id);
      batch.update(todoRef, { order: index });
    });
    await batch.commit();
  }, []);

  const moveTodoToTop = useCallback(async (id: string) => {
    // Find the minimum order among current todos
    const minOrder = todos.length > 0 
      ? Math.min(...todos.map(t => t.order || 0)) 
      : 0;
    
    // Set order to minOrder - 1 to ensure it goes to top
    await db.collection('todos').doc(id).update({ 
      order: minOrder - 1 
    });
  }, [todos]);

  const updateTimeBoxEntry = useCallback(async (hour: number, slot: 1 | 2, text: string) => {
    const docRef = db.collection('timeboxes').doc(todayStr);
    const hourKey = hour.toString();
    const snap = await docRef.get();
    const data = (snap.exists ? snap.data() : { entries: {} }) as any;
    
    const currentEntries = data?.entries || {};
    const entry = currentEntries[hourKey] || { slot1: '', slot2: '' };
    const newEntries = { ...currentEntries, [hourKey]: { ...entry, [`slot${slot}`]: text } };
    
    const payload: any = { entries: newEntries };

    // If position is missing in DB (first edit of the day), use current local position from ref
    if (!data?.position) {
        payload.position = timeBoxRef.current?.position || { x: window.innerWidth - 600, y: 100 };
    }

    await docRef.set(payload, { merge: true });
  }, [todayStr]);

  const updateTimeBoxPosition = useCallback((pos: { x: number, y: number }) => 
    db.collection('timeboxes').doc(todayStr).set({ position: pos }, { merge: true }), [todayStr]);
  
  const updateTimeBoxColors = useCallback(async (colors: Record<string, string>) => {
    const docRef = db.collection('timeboxes').doc(todayStr);
    const snap = await docRef.get();
    const data = (snap.exists ? snap.data() : {}) as any;

    const payload: any = { colors };
    
    // If position is missing in DB, use current local position from ref
    if (!data?.position) {
        payload.position = timeBoxRef.current?.position || { x: window.innerWidth - 600, y: 100 };
    }

    await docRef.set(payload, { merge: true });
  }, [todayStr]);

  const addNote = useCallback(async () => {
    const docRef = await db.collection('notes').add({
      content: '',
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
      size: { width: 300, height: 300 },
      status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastEdited: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }, []);

  const updateNoteContent = (id: string, content: string) => 
    db.collection('notes').doc(id).update({ content, lastEdited: firebase.firestore.FieldValue.serverTimestamp() });
  
  const updateNotePosition = (id: string, position: { x: number; y: number }) => 
    db.collection('notes').doc(id).update({ position });
  
  const updateNoteSize = (id: string, size: { width: number; height: number }) => 
    db.collection('notes').doc(id).update({ size, lastEdited: firebase.firestore.FieldValue.serverTimestamp() });
  
  const updateNoteColor = (id: string, color: string) => 
    db.collection('notes').doc(id).update({ color, lastEdited: firebase.firestore.FieldValue.serverTimestamp() });
  
  const updateNoteStatus = (id: string, status: any) => 
    db.collection('notes').doc(id).update({ status, lastEdited: firebase.firestore.FieldValue.serverTimestamp() });
  
  const deleteNote = (id: string) => db.collection('notes').doc(id).delete();
  
  const bringToFront = (id: string) => 
    db.collection('notes').doc(id).update({ status: 'active', lastEdited: firebase.firestore.FieldValue.serverTimestamp() });

  const addFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => e.target?.result && db.collection('files').add({ 
        name: file.name, 
        type: file.type, 
        dataUrl: e.target.result, 
        size: file.size, 
        createdAt: firebase.firestore.FieldValue.serverTimestamp() 
    });
    reader.readAsDataURL(file);
  };
  
  const deleteFile = (id: string) => db.collection('files').doc(id).delete();

  return { 
    notes, files, timeBox, todos, todayStr, todoBoxPos, todoBoxSize,
    addNote, updateNoteContent, updateNotePosition, updateNoteSize, updateNoteColor, updateNoteStatus, deleteNote, bringToFront,
    addFile, deleteFile,
    updateTimeBoxEntry, updateTimeBoxPosition, updateTimeBoxColors,
    addTodo, toggleTodo, toggleFixedTodo, deleteTodo, updateTodoPosition, updateTodoBoxSize, updateTodoOrder, moveTodoToTop
  };
};
