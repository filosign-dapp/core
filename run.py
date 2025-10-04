#!/usr/bin/env python3

import os
import subprocess
import signal
import sys
import time
from pathlib import Path
from threading import Thread

class ProcessManager:
    def __init__(self):
        self.client_process = None
        self.server_process = None
        self.observer = None
        self.is_running = False
        
    def start_processes(self):
        print("🚀 Starting client and server...")
        
        try:
            self.client_process = subprocess.Popen(
                ["bun", "run", "client:dev"],
                cwd=os.getcwd(),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            self.server_process = subprocess.Popen(
                ["bun", "run", "server:start"],
                cwd=os.getcwd(),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            Thread(target=self._stream_output, args=(self.client_process, "CLIENT"), daemon=True).start()
            Thread(target=self._stream_output, args=(self.server_process, "SERVER"), daemon=True).start()
            
            print("✅ Both processes started successfully!")
            
        except Exception as e:
            print(f"❌ Error starting processes: {e}")
            self.stop_processes()
    
    def _stream_output(self, process, label):
        while process and process.poll() is None:
            try:
                line = process.stdout.readline()
                if line:
                    print(f"[{label}] {line.rstrip()}")
            except:
                break
    
    def stop_processes(self):
        print("🛑 Stopping processes...")
        
        processes = [self.client_process, self.server_process]
        for process in processes:
            if process and process.poll() is None:
                try:
                    process.terminate()
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                except:
                    pass
        
        self.client_process = None
        self.server_process = None
        print("✅ Processes stopped")
    
    def restart_processes(self):
        print("🔄 Restarting processes due to file changes...")
        self.stop_processes()
        time.sleep(1)
        self.start_processes()

def create_change_handler(process_manager, FileSystemEventHandler):
    class TypeScriptChangeHandler(FileSystemEventHandler):
        def __init__(self, process_manager):
            super().__init__()
            self.process_manager = process_manager
            self.last_restart = 0
            self.debounce_seconds = 2
        
        def on_modified(self, event):
            if event.is_directory:
                return
                
            if self._should_restart(event.src_path):
                current_time = time.time()
                if current_time - self.last_restart > self.debounce_seconds:
                    self.last_restart = current_time
                    print(f"📝 TypeScript file changed: {event.src_path}")
                    self.process_manager.restart_processes()
        
        def _should_restart(self, file_path):
            path = Path(file_path)
            
            if path.suffix not in ['.ts', '.tsx', '.js', '.jsx']:
                return False
                
            path_str = str(path)
            
            exclude_patterns = [
                'node_modules',
                '.git',
                'dist',
                'build',
                '.next',
                'coverage',
                '.cache',
                'artifacts'
            ]
            
            for pattern in exclude_patterns:
                if pattern in path_str:
                    return False
            
            return True
    
    return TypeScriptChangeHandler(process_manager)

def setup_file_watcher(process_manager, Observer, FileSystemEventHandler):
    event_handler = create_change_handler(process_manager, FileSystemEventHandler)
    observer = Observer()
    
    watch_paths = [
        "packages/client/src",
        "packages/client/api", 
        "packages/server",
        "packages/lib",
        "packages/contracts/src"
    ]
    
    for watch_path in watch_paths:
        full_path = os.path.join(os.getcwd(), watch_path)
        if os.path.exists(full_path):
            observer.schedule(event_handler, full_path, recursive=True)
            print(f"👀 Watching: {watch_path}")
    
    return observer

def signal_handler(sig, frame, process_manager):
    print("\n🛑 Received interrupt signal, shutting down...")
    process_manager.stop_processes()
    if process_manager.observer:
        process_manager.observer.stop()
    sys.exit(0)

def main():
    print("🏗️  Filosign Development Server")
    print("===============================")
    
    if not os.path.exists("package.json"):
        print("❌ Error: package.json not found. Please run from the project root.")
        sys.exit(1)
    
    try:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
    except ImportError:
        print("❌ Missing required dependency: watchdog")
        print("📦 Please install it using one of these methods:")
        print("   • sudo apt install python3-watchdog  (Ubuntu/Debian)")
        print("   • sudo dnf install python3-watchdog  (Fedora)")
        print("   • pip3 install watchdog")
        print("   • python3 -m pip install --user watchdog")
        print("\nAlternatively, you can run without file watching (manual restart only):")
        response = input("Continue without file watching? (y/N): ").lower().strip()
        
        if response == 'y' or response == 'yes':
            print("⚠️  Running without file watching - you'll need to manually restart when files change")
            Observer = None
            FileSystemEventHandler = None
        else:
            print("Exiting. Please install watchdog and try again.")
            sys.exit(1)
    
    process_manager = ProcessManager()
    
    signal.signal(signal.SIGINT, lambda s, f: signal_handler(s, f, process_manager))
    signal.signal(signal.SIGTERM, lambda s, f: signal_handler(s, f, process_manager))
    
    process_manager.start_processes()
    
    if Observer and FileSystemEventHandler:
        process_manager.observer = setup_file_watcher(process_manager, Observer, FileSystemEventHandler)
        process_manager.observer.start()
        print("\n📡 File watcher active. Press Ctrl+C to stop.")
        print("💡 The server will automatically restart when TypeScript files change.\n")
    else:
        print("\n⚠️  File watching disabled. Press Ctrl+C to stop.")
        print("💡 Restart manually when you make changes.\n")
    
    process_manager.is_running = True
    
    try:
        while process_manager.is_running:
            client_running = process_manager.client_process and process_manager.client_process.poll() is None
            server_running = process_manager.server_process and process_manager.server_process.poll() is None
            
            if not client_running or not server_running:
                print("⚠️  One or more processes have stopped unexpectedly")
                if not client_running:
                    print("❌ Client process stopped")
                if not server_running:
                    print("❌ Server process stopped")
                break
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        pass
    finally:
        signal_handler(signal.SIGINT, None, process_manager)

if __name__ == "__main__":
    main()