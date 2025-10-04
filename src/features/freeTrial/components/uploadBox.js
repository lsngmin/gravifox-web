import React, {useState} from "react";
import FileUploader from "../FileUploader";
import {useUpload} from "../provider/uploadProvider";
import FileUploadAPI from "../api/fileUploadAPI";
import StartAnalyzeButton from "./startAnalyzeButton";
import Spinner from "./loadingSpinner";
import FileAnalyzeAPI from "../api/fileAnalyzeAPI";
import ResultAnalyze from "./resultAnalyze";

const UploadBox = () => {
    const {setUploadData} = useUpload();
    const {fileUpload} = FileUploadAPI();
    const [image, setImage] = useState();
    const [startAnalyze, setStartAnalyze] = useState(false);
    const [endAnalyze, setEndAnalyze] = useState(false);
    const [analyzeResult, setAnalyzeResult] = useState(false);
    const {fileAnalyze} = FileAnalyzeAPI();


    /**
     *  파일을 받으면 onLoading을 true로 변경하여 LoadingSpinner가 동작하게 합니다.
     *  fileUpload API를 호출하고 정상흐름이라면 스피너의 동작을 멈추고 onUploadComplete를 통해 완료됐다는 동작을 전달하여 애니메이션이 동작하도록 합니다.
     *
     *  error가 발생하면 스피너의 동작을 멈추고 예외처리 합니다.
     *
     * @param file - onUpload에 저장된 사용자가 업로드한 파일입니다
     * @returns {Promise<void>} - 반환값은 존재하지 않지만 API요청을 통해 받아온 사진의 UUID를 provider에 전역적으로 저장하여 분석 요청 API에 사용됩니다.
     */

    const handleFileChange = async (file) => {
        const response = await fileUpload(file);//todo fileUpload API에서 에러가 발생할 경우 throws 하는 에러를 catch하는 로직이 필요합니다.
        //provider에 사진의 UUID를 저장합니다.
        setUploadData(response.data[0])
        if (response?.status === 200) {
            const url = URL.createObjectURL(file);
            setImage(url);
        } else {
            //todo 에러 발생 시 예외처리 로직이 필요합니다.
        }
    };

    const handleResetImage = () => {
        URL.revokeObjectURL(image)
        setImage(undefined);
    }
    const  handleStartAnalyze = async () => {
        setStartAnalyze(true)
        const response = await fileAnalyze();//todo fileAnalyze에서 throw하는 error를 catch하는 로직이 필요합니다.
        if (response?.status === 200) {
            setAnalyzeResult(response.data)
            setEndAnalyze(true)
        } else {
            //todo 에러 발생 시 예외처리 로직이 필요합니다.
        }
    }

    return (
        <>
            {
                // image는 사진이 업로드 되면 사진 파일의 blob주소가 저장되는 변수입니다.
                image
                    ? (
                        <div className="max-w-sm sm:max-w-4xl mx-auto p-6 mt-10 rounded-2xl shadow-lg border border-gray-200 bg-white">
                            <div className="flex flex-col items-center justify-center h-auto gap-4">
                                <img src={image} alt="Preview" className="cursor-pointer" />
                                {/*
                                    startAnalyze은 사용자가 start 버튼을 눌렀을 때 분석 과정을 시작하는 trigger입니다.
                                    startAnalyze가 true이면 분석 중, false면 분석 전 상태입니다.
                                  */}
                                {startAnalyze
                                    ? (
                                        /*
                                          endAnalyze는 분석이 끝났을 때 true로 바뀝니다.
                                          분석 완료(endAnalyze === true)면 결과 컨테이너를, 아니면 Spinner를 보여줍니다.
                                        */
                                        endAnalyze
                                            ? <ResultAnalyze analyzeResult={analyzeResult}/>
                                            : <Spinner />
                                    )
                                    /*
                                      startAnalyze가 false면 분석 시작 전이므로,
                                      StartAnalyzeButton을 노출합니다.
                                    */
                                    : <StartAnalyzeButton resetImage={handleResetImage} startAnalyze={handleStartAnalyze} />
                                }
                            </div>
                        </div>
                    )
                    : (
                        /* image 값이 없으면 파일 업로드 컴포넌트만 보여줍니다. */
                        <div className="max-w-sm sm:max-w-4xl mx-auto p-6 mt-10 rounded-2xl shadow-lg border border-gray-200 bg-white">
                            <FileUploader onUpload={handleFileChange} />
                        </div>
                    )
            }

        </>
    );
};

export default UploadBox;
