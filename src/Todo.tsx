import React from "react";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient("https://xazcjsoxxsgftjfyixzm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemNqc294eHNnZnRqZnlpeHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4ODEyNjMsImV4cCI6MjA0NjQ1NzI2M30.z3yr79nvNDQk_uW550hxnUkrQpo0d2m_gZC27VoUwkQ");

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");

    const fetchTodos = async () => {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .order('id', { ascending: true });
        if (error) {
            console.error(error);
        } else {
            setTodos(data);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const addTodo = async () => {
        const newText: string = newTodo.trim();
        if (newText === "") return;
        setTodos([...todos, { id: Date.now(), text: newText, completed: false },]);
        setNewTodo("");
        const { data, error } = await supabase
            .from('todos')
            .insert([{ text: newText, completed: false }])
        if (error) {
            console.error(error);
        }
        fetchTodos();
    };

    const toggleTodo = async (id: number) => {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
        const { data, error } = await supabase
            .from('todos')
            .update({ completed: !todo.completed })
            .eq('id', id)
            .single();
        if (error) {
            console.error(error);
        }
        fetchTodos();
    };

    const deleteTodo = async (id: number) => {
        setTodos(todos.filter(todo => todo.id !== id));
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', id);
        if (error) {
            console.error(error);
        }
        fetchTodos();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    };

    return (
        <div className="p-4 min-h-screen bg-gray-100 text-black">
            <h1 className="text-2xl font-bold mb-4">Todo List</h1>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id} className="flex justify-between items-center p-2 border-b">
                        <div className={`flex items-center ${todo.completed ? "line-through" : ""}`}>
                            <input type="checkbox" className="mr-2" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
                            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
                        </div>
                        <button className="ml-2 p-2 bg-red-500 text-white rounded" onClick={() => deleteTodo(todo.id)}>
                            Odebrat
                        </button>
                    </li>
                ))}
                <li className="flex justify-between items-center p-2 border-b">
                    <input type="text" className="flex-grow p-2 bg-inherit" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nový úkol" />
                    <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={addTodo}>
                        Přidat
                    </button>
                </li>
            </ul>
        </div>
    );
}