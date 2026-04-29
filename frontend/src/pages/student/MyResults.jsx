import React, { useState, useEffect } from 'react';
import { getMyAllResults } from '../../services/api';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiClock, FiAward, FiBookOpen, FiSearch } from 'react-icons/fi';

const MyResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await getMyAllResults();
                if (res.data.success) {
                    setResults(res.data.data);
                }
            } catch (error) {
                console.error('Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const filteredResults = results.filter(r => {
        const matchesSearch = r.test_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              r.course_title.toLowerCase().includes(searchTerm.toLowerCase());
        const percentage = parseFloat(r.percentage);
        const passing = parseInt(r.passing_score);
        const isPassed = percentage >= passing;
        
        if (filterStatus === 'passed') return matchesSearch && isPassed;
        if (filterStatus === 'failed') return matchesSearch && !isPassed;
        return matchesSearch;
    });

    // Stats
    const totalTests = results.length;
    const passedTests = results.filter(r => parseFloat(r.percentage) >= parseInt(r.passing_score)).length;
    const avgScore = totalTests > 0 ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / totalTests).toFixed(1) : 0;
    const bestScore = totalTests > 0 ? Math.max(...results.map(r => parseFloat(r.percentage))).toFixed(1) : 0;

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-6">My Results</h1>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shrink-0">
                        <FiBookOpen className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tests Taken</p>
                        <h3 className="text-xl font-bold text-slate-900">{totalTests}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mr-3 shrink-0">
                        <FiCheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Passed</p>
                        <h3 className="text-xl font-bold text-slate-900">{passedTests} / {totalTests}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center mr-3 shrink-0">
                        <FiAward className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Score</p>
                        <h3 className="text-xl font-bold text-slate-900">{avgScore}%</h3>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-3 shrink-0">
                        <FiAward className="text-white" size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Best Score</p>
                        <h3 className="text-xl font-bold text-slate-900">{bestScore}%</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search by test or course name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'passed', 'failed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                                filterStatus === status 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results List */}
            {filteredResults.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <FiBookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-1">
                        {results.length === 0 ? 'No tests taken yet' : 'No results match your filter'}
                    </h3>
                    <p className="text-slate-500 mb-4">
                        {results.length === 0 ? 'Complete some tests to see your results here.' : 'Try adjusting your search or filter.'}
                    </p>
                    {results.length === 0 && (
                        <Link to="/student/courses" className="text-blue-600 font-medium hover:text-blue-700">
                            Browse Courses →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredResults.map(result => {
                        const percentage = parseFloat(result.percentage);
                        const passing = parseInt(result.passing_score);
                        const isPassed = percentage >= passing;
                        const date = new Date(result.submitted_at);

                        let scoreColor = 'text-red-600';
                        let scoreBg = 'bg-red-50 border-red-200';
                        let barColor = 'bg-red-500';
                        if (percentage >= 70) {
                            scoreColor = 'text-emerald-600';
                            scoreBg = 'bg-emerald-50 border-emerald-200';
                            barColor = 'bg-emerald-500';
                        } else if (percentage >= passing) {
                            scoreColor = 'text-amber-600';
                            scoreBg = 'bg-amber-50 border-amber-200';
                            barColor = 'bg-amber-500';
                        }

                        return (
                            <div key={result.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 truncate max-w-[200px]">
                                                {result.course_title}
                                            </span>
                                            {result.course_category && (
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                    {result.course_category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{result.test_title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center">
                                                <FiClock className="mr-1" />
                                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span>
                                                Score: {result.score} / {result.max_score}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        {/* Score circle */}
                                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                <path className={scoreColor} strokeDasharray={`${percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            </svg>
                                            <span className={`absolute text-sm font-black ${scoreColor}`}>{Math.round(percentage)}%</span>
                                        </div>

                                        {/* Pass/Fail Badge */}
                                        <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${isPassed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {isPassed ? <><FiCheckCircle className="mr-1" /> Passed</> : <><FiXCircle className="mr-1" /> Failed</>}
                                        </div>

                                        {/* View Detail */}
                                        <Link 
                                            to={`/student/result/${result.test_id}`}
                                            className="px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors text-sm whitespace-nowrap"
                                        >
                                            View Detail
                                        </Link>
                                    </div>
                                </div>

                                {/* Progress bar at bottom */}
                                <div className="w-full bg-slate-100 h-1">
                                    <div className={`${barColor} h-1 transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyResults;
