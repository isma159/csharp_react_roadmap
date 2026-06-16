import "./App.css"
import {useState} from "react";
import {Checkbox} from "./components/ui/checkbox.tsx";
import {Input} from "./components/ui/input.tsx";


type Filters = "All" | "Active" | "Completed";

const filterArr: Filters[] = ["All", "Active", "Completed"];

interface Task {
    id: number,
    title: string,
    completed: boolean
}

function App() {

  const [filter, setFilter] = useState<Filters>("All");
  const [tasks, setTasks] = useState<Task[]>([])

  return (
      <div className="flex justify-center items-center h-screen bg-[#0B0F19]">
        <div className="flex flex-col h-100 w-140 bg-[#161B26] rounded-2xl border-2 border-[#2D3748]">
          <TopBar filter={filter} onFilterChange={setFilter}/>
          <TableView tasks={tasks} setTasks={setTasks} filter={filter}/>
          <BottomBar tasks={tasks} setTasks={setTasks}/>
        </div>
      </div>
  );
}

function TopBar({filter, onFilterChange}: { filter: Filters, onFilterChange: (filter: Filters) => void }) {
  return (
      <div className="flex flex-col w-full h-1/4 rounded-t-2xl border-b-2 border-[#242C3D]">
        <div className="flex w-full h-1/2 p-4">
          <h1 className="text-2xl text-white">TASK PLANNER // CORE TASKS</h1>
        </div>
        <div className="flex items-center w-full h-1/2 p-4 gap-4">
          {filterArr.map((f: Filters) => (
              <FilterButton key={f} selected={filter === f} value={f.toUpperCase()} onClick={() => {onFilterChange(f)}}/>
          ))}
        </div>
      </div>
  );
}

function TableView({tasks, setTasks, filter}: {tasks:Task[], setTasks: (tasks: Task[]) => void, filter:Filters}) {

    const filteredList = tasks.filter(t => {
        if (filter === "Active") return !t.completed;
        if (filter === "Completed") return t.completed;
        return true;
    })

    return (
        <div className={`flex-1 overflow-y-auto ${filteredList.length <= 0 ? "flex justify-center" : ""}`}>
            {

                filteredList.length > 0 ? filteredList.map((t: Task) => (
                    <TaskItem key={t.id} task={t} tasks={tasks} setTasks={setTasks}/>
                )) : <h1 className="p-4 text-white">NO TASKS</h1>
            }
        </div>
    );

}

function BottomBar({tasks, setTasks}: {tasks:Task[], setTasks: (tasks:Task[]) => void}) {
    const [input, setInput] = useState<string>("");

    function formatAndSend() {

        if (input.trim() === "") return;

        const task: Task = {
            id: Date.now(),
            title: input,
            completed: false
        }

        setTasks([...tasks, task]);
        setInput("");
    }

  return (
      <div className="flex w-full h-1/6 items-center p-4 gap-4 border-t-2 border-[#242C3D]">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Insert title of the task" className="rounded-md text-white border-2 border-[#242C3D] bg-[#0B0F19] placeholder-[#4A5568]"/>
          <button onClick={() =>formatAndSend()} className="bg-[#00D2FF] rounded-md p-1.25 text-xs border-2 border-[#0099BA] hover:border-[#007D98] hover:bg-[#00B5DC] transition-colors">Submit</button>
      </div>
  );

}

function FilterButton({value, selected, onClick}: {value:string, selected:boolean, onClick: () => void}) {

  return (
      <button onClick={onClick} className={`rounded-md border-2 text-[12px] p-1 h-7 transition-colors ${selected ? "text-[#00A3C4] border-[#00A3C4] bg-[#0E3A4A]" : "text-white hover:bg-[#2D3748] hover:border-[#4A5568] border-[#2D3748] bg-[#232A37]"}`}>[{value}]</button>
  );

}

function TaskItem({task, tasks, setTasks}: {task:Task, tasks:Task[], setTasks: (tasks:Task[]) => void}) {

    function toggleTask(id: number) {

        setTasks(tasks.map(t => (
            t.id === id ? {...t, completed: !t.completed} : t
        )))

    }

    return (
        <div className="relative flex items-center w-full h-12.5 p-4 gap-4 border-b-2 border-[#242C3D]">
            <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="rounded size-5 border-2 border-[#4A5568] font-black hover:border-[#00D2FF] data-[state=checked]:bg-[#1A202C] data-[state=checked]:border-[#52E5A6] data-[state=checked]:text-[#52E5A6]"/>
            <h1 className="text-white">{task.title}</h1>
            <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="absolute right-5 text-red-400 text-xl hover:rotate-90 hover:scale-120 hover:font-bold transition-all">✕</button>
        </div>
    );

}

export default App
