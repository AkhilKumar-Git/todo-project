"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, Trash2, Star } from 'lucide-react'

interface Todo {
  id: number;
  text: string;
  isImportant: boolean;
}

export function TodoAppComponent() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), isImportant: false }])
      setNewTodo("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo()
    }
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const toggleImportant = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, isImportant: !todo.isImportant } : todo
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 space-y-6 relative">
        <div className="absolute top-4 right-4">
          <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800">Todo List</h1>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add a new task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-grow"
          />
          <Button
            onClick={addTodo}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-black text-white hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-5 h-5 mr-1" />
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onDelete={deleteTodo} 
              onToggleImportant={toggleImportant} 
            />
          ))}
        </ul>
        {todos.length === 0 && (
          <p className="text-center text-gray-500">No todos yet. Add one above!</p>
        )}
      </div>
    </div>
  )
}

interface TodoItemProps {
  todo: Todo;
  onDelete: (id: number) => void;
  onToggleImportant: (id: number) => void;
}

function TodoItem({ todo, onDelete, onToggleImportant }: TodoItemProps) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX.current
    setOffset(Math.max(-100, Math.min(100, diff)))
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (offset < -50) {
      setOffset(-100)
    } else if (offset > 50) {
      setOffset(100)
    } else {
      setOffset(0)
    }
  }

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleTouchEnd()
      }
    }

    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="relative overflow-hidden">
      <div
        className="bg-gray-100 rounded-lg p-3 shadow-sm transition-all hover:shadow-md flex items-center justify-between cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={(e) => {
          startX.current = e.clientX
          setIsDragging(true)
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            const diff = e.clientX - startX.current
            setOffset(Math.max(-100, Math.min(100, diff)))
          }
        }}
      >
        <span className={`flex-grow ${todo.isImportant ? 'font-bold text-blue-600' : ''}`}>
          {todo.text}
        </span>
      </div>
      <Button
        onClick={() => onDelete(todo.id)}
        className="absolute top-0 right-full h-full px-3 bg-red-500 text-white"
        style={{
          transform: `translateX(${100 + offset}px)`,
        }}
      >
        <Trash2 className="w-5 h-5" />
        <span className="sr-only">Delete todo</span>
      </Button>
      <Button
        onClick={() => onToggleImportant(todo.id)}
        className={`absolute top-0 left-full h-full px-3 ${
          todo.isImportant ? 'bg-yellow-500' : 'bg-gray-400'
        } text-white`}
        style={{
          transform: `translateX(${offset - 100}px)`,
        }}
      >
        <Star className="w-5 h-5" />
        <span className="sr-only">{todo.isImportant ? 'Unmark as important' : 'Mark as important'}</span>
      </Button>
    </div>
  )
}