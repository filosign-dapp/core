import { useState, useMemo } from "react";
import DashboardLayout from "../layout";
import { initialFilesAndFolders } from "./_components/data";
import Header from "./_components/Header";
import Card from "./_components/Card";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortCriteria, setSortCriteria] = useState('name');

    const filteredAndSortedItems = useMemo(() => {
        return initialFilesAndFolders
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (sortCriteria === 'name') {
                    return a.name.localeCompare(b.name);
                }
                if (sortCriteria === 'lastModified') {
                    return (b.lastModified || '').localeCompare(a.lastModified || '');
                }
                return 0;
            });
    }, [searchQuery, sortCriteria]);

    const folders = filteredAndSortedItems.filter(item => item.type === 'folder');
    const files = filteredAndSortedItems.filter(item => item.type === 'file');

    return (
        <DashboardLayout>
            <div className="p-8">
                <Header 
                    onSearch={setSearchQuery} 
                    onSort={setSortCriteria} 
                    onViewChange={setViewMode}
                    currentView={viewMode}
                />
                
                <motion.div layout>
                    <AnimatePresence>
                        {folders.length > 0 && (
                            <motion.section 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="mb-12"
                            >
                                <h2 className="text-xl font-bold mb-4">Folders</h2>
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                                    {folders.map(item => <Card key={item.id} item={item} viewMode={viewMode} />)}
                                </div>
                            </motion.section>
                        )}
                        
                        {files.length > 0 && (
                            <motion.section 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <h2 className="text-xl font-bold mb-4">Files</h2>
                                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                                    {files.map(item => <Card key={item.id} item={item} viewMode={viewMode} />)}
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}