import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { invokeEdgeFunction } from '@/lib/supabase'
import toast from 'react-hot-toast'
import CodePreviewModal from './CodePreviewModal'
import { 
  User, 
  LogOut, 
  Bot, 
  Code, 
  ListTodo, 
  Loader2, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react'

interface Todo {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  estimatedTime: string
  aiGenerated: boolean
  tags: string[]
}

interface CodeGeneration {
  code: string
  language: string
  framework: string
  explanation: string
  features: string[]
  prompt?: string
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'todos' | 'code'>('overview')
  const [todos, setTodos] = useState<Todo[]>([])
  const [generatedCode, setGeneratedCode] = useState<CodeGeneration | null>(null)
  const [todoPrompt, setTodoPrompt] = useState('')
  const [codePrompt, setCodePrompt] = useState('')
  const [isGeneratingTodos, setIsGeneratingTodos] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)

  const handleGenerateTodos = async () => {
    if (!todoPrompt.trim()) {
      toast.error('Please enter a prompt for todo generation')
      return
    }

    setIsGeneratingTodos(true)
    try {
      const response = await invokeEdgeFunction<{todos: Todo[]}>
        ('ai-todo-generator', {
          prompt: todoPrompt,
          category: 'investment',
          priority: 'medium'
        })

      if (response.error) {
        toast.error(response.error.message)
        console.error('Todo generation error:', response.error)
        return
      }

      if (response.data?.todos) {
        setTodos(prevTodos => [...prevTodos, ...response.data!.todos])
        toast.success(`Generated ${response.data.todos.length} new todos!`)
        setTodoPrompt('')
      } else {
        toast.error('No todos were generated')
      }
    } catch (error) {
      console.error('Failed to generate todos:', error)
      toast.error('Failed to generate todos')
    } finally {
      setIsGeneratingTodos(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!codePrompt.trim()) {
      toast.error('Please enter a prompt for code generation')
      return
    }

    setIsGeneratingCode(true)
    try {
      const response = await invokeEdgeFunction<CodeGeneration>(
        'ai-code-generator', {
          prompt: codePrompt,
          language: 'python',
          framework: 'python'
        })

      if (response.error) {
        toast.error(response.error.message)
        console.error('Code generation error:', response.error)
        return
      }

      if (response.data) {
        // Add the original prompt to the response data for better UX
        const codeWithPrompt = { ...response.data, prompt: codePrompt }
        setGeneratedCode(codeWithPrompt)
        setShowCodeModal(true)
        toast.success('Code generated successfully!')
        setCodePrompt('')
      } else {
        toast.error('No code was generated')
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
      toast.error('Failed to generate code')
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      // Error handling is done in the auth context
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                AI Investment Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'todos', name: 'AI Todos', icon: ListTodo },
              { id: 'code', name: 'AI Code', icon: Code }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stats Cards */}
              {[
                { title: 'Portfolio Value', value: '$125,430', change: '+5.2%', icon: DollarSign, color: 'green' },
                { title: 'Monthly Gain', value: '$3,240', change: '+12.1%', icon: TrendingUp, color: 'green' },
                { title: 'AI Todos', value: todos.length.toString(), change: 'Generated', icon: ListTodo, color: 'blue' },
                { title: 'Code Snippets', value: generatedCode ? '1' : '0', change: 'Generated', icon: Code, color: 'purple' }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            stat.color === 'green' ? 'bg-green-100' :
                            stat.color === 'blue' ? 'bg-blue-100' :
                            stat.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${
                              stat.color === 'green' ? 'text-green-600' :
                              stat.color === 'blue' ? 'text-blue-600' :
                              stat.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {stat.title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stat.value}
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`text-sm font-medium ${
                          stat.color === 'green' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-8">
                <div className="text-center">
                  <Bot className="mx-auto h-12 w-12 text-blue-600" />
                  <h2 className="mt-4 text-2xl font-bold text-gray-900">
                    Welcome to AI Investment Platform
                  </h2>
                  <p className="mt-2 text-lg text-gray-600">
                    Generate intelligent investment todos and code snippets with AI assistance
                  </p>
                  <div className="mt-6 flex justify-center space-x-4">
                    <button
                      onClick={() => setActiveTab('todos')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ListTodo className="w-4 h-4 mr-2" />
                      Generate Todos
                    </button>
                    <button
                      onClick={() => setActiveTab('code')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Generate Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'todos' && (
          <div className="space-y-6">
            {/* Todo Generator */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI Todo Generator</h2>
                <p className="text-sm text-gray-600">Generate investment-related todos with AI assistance</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex space-x-4">
                  <textarea
                    value={todoPrompt}
                    onChange={(e) => setTodoPrompt(e.target.value)}
                    placeholder="Enter what you want to focus on (e.g., 'analyze tech stocks', 'research renewable energy investments')..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isGeneratingTodos}
                  />
                  <button
                    onClick={handleGenerateTodos}
                    disabled={isGeneratingTodos || !todoPrompt.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGeneratingTodos ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingTodos ? 'Generating...' : 'Generate Todos'}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Todos */}
            {todos.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Generated Todos ({todos.length})</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {todos.map((todo) => (
                    <div key={todo.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{todo.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              todo.priority === 'high' ? 'bg-red-100 text-red-800' :
                              todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {todo.priority} priority
                            </span>
                            <span className="text-xs text-gray-500">
                              {todo.estimatedTime}
                            </span>
                            <div className="flex space-x-1">
                              {todo.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6">
            {/* Code Generator */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">AI Code Generator</h2>
                <p className="text-sm text-gray-600">Generate investment-related code with AI assistance</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex space-x-4">
                  <textarea
                    value={codePrompt}
                    onChange={(e) => setCodePrompt(e.target.value)}
                    placeholder="Describe the code you want to generate (e.g., 'portfolio tracker component', 'stock price calculator')..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isGeneratingCode}
                  />
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode || !codePrompt.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isGeneratingCode ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4 mr-2" />
                    )}
                    {isGeneratingCode ? 'Generating...' : 'Generate Code'}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Code Status */}
            {generatedCode && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Code Generated Successfully</h3>
                  <p className="text-sm text-gray-600">
                    {generatedCode.language} code for: {generatedCode.prompt || 'investment analysis'}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {generatedCode.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCodeModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      View Code
                    </button>
                    <button
                      onClick={() => setGeneratedCode(null)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Code Preview Modal */}
      <CodePreviewModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        code={generatedCode?.code || ''}
        language={generatedCode?.language || 'python'}
        filename={`${generatedCode?.prompt?.replace(/\s+/g, '_').toLowerCase() || 'generated_investment_code'}.py`}
        explanation={generatedCode?.explanation}
      />
    </div>
  )
}