import React, {useEffect, useState} from "react";
import dayjs from "dayjs";
import IssueFetchDataAPI from "features/issues/api/issueFetchDataAPI";


function IssueTable() {
    const {fetchData} = IssueFetchDataAPI();
    const [issuesData, setIssuesData] = useState([]);

    useEffect(() => {
        const loadIssuesData = async () => {
            try {
                const data = await fetchData();
                setIssuesData(data.data);  // 데이터를 상태로 설정
            } catch (error) {
            }
        };
        loadIssuesData();
    }, [fetchData]);
    return (
        <>
            <div className="max-w-7xl mx-auto pt-20 px-10">
                <h1 className="sm:text-2xl md:text-3xl pl-2 my-2 border-l-4  font-sans font-bold border-teal-400">
                    Overview of Current Open Issues

                </h1>
                <div className="gap-1 grid grid-cols-1 sm:gap-10 pt-20 px-1 sm:px-32 w-full max-w-7xl mx-auto">

                    {issuesData.length > 0 ? (
                        issuesData.map((issue) => (
                    <div>
                        <div className="flex justify-between pb-1">
                            <span className="inline-flex items-center m-2 px-2 py-1 bg-gray-200 rounded-lg text-xxs sm:text-sm font-semibold text-gray-600">
                                <span className="">Latest Updated At. {dayjs(issue.updated_at).format("MM/DD")}</span>
                            </span>

                            <span className="inline-flex items-center m-2 px-3 py-1 bg-green-200 hover:bg-green-300 rounded-lg text-xxs sm:text-sm font-semibold text-green-600">
                                <span className="">Current Status. {issue.state.toUpperCase()}</span>
                            </span>
                        </div>
                        <div
                            key={issue.id}
                            className="p-4 border border-gray-300 rounded-lg "
                        >
                            <h3 className="text-sm sm:text-lg font-semibold">{issue.title}&nbsp; #{issue.number} - </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 ml-1.5 mb-1">{issue.body}</p>
                            <span className="inline-flex items-center rounded-md bg-gray-50 mt-1 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset">
                                Affected Server. TrueVisionBoxAPIServer
                            </span>
                        </div>
                    </div>

                        ))
                        ) : (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} >
                                    <div className="flex justify-between pb-1">
                                        <span className="inline-flex items-center m-2 px-2 py-1 bg-gray-200 rounded-lg text-xxs sm:text-sm font-semibold text-gray-600">
                                            <span className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></span>
                                        </span>

                                        <span className="inline-flex items-center m-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-xxs sm:text-sm font-semibold text-green-600">
                                            <span className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></span>
                                        </span>
                                    </div>

                                    <div className="p-4 border border-gray-300 rounded-lg animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" aria-hidden="true"></div>
                                        <p className="h-3 bg-gray-200 rounded w-2/4 mb-3 animate-pulse" aria-hidden="true"></p>
                                        <span className="h-3 bg-gray-200 rounded w-1/3 animate-pulse" aria-hidden="true"></span>
                                    </div>
                                </div>
                            ))}
                            <p className="text-center text-gray-500">이슈 데이터를 불러오는 중입니다...</p>
                        </div>
                        )}
                </div>
            </div>
        </>
);
}

export default IssueTable;
