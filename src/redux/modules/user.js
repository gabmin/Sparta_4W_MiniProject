//로그인,회원가입 모듈

import produce from "immer";
import {createAction, handleActions} from "redux-actions";
import {apis} from "../../lib/axios";
import {signupShow, loginShow} from "./show";
import {Cookies} from "react-cookie";
import showError from "./error";

//로그인,회원가입 페이지 렌더링 응답? 회원가입 정보 초기값
const initialState = {
    createAccount: [
        {
            userID: "userID",
            PW: "PW",
            confirmPW: "confirmPW"
        }
    ],
    warnID: ""
}

const CREATE_ACCOUNT = "CREATE_ACCOUNT";
const WARN_ID = "WARN_ID";

const creatAccount_ = createAction(
    CREATE_ACCOUNT,
    (userID, PW, confirmPW) => ({userID, PW, confirmPW})
);
const changeWarnID = createAction(WARN_ID, (warnID) => ({warnID}))

//회원가입 등록
const createAccountMW = (userID, PW, confirmPW) => {
    return function (dispatch, getState, {history}) {
        const user = {
            userID: userID,
            PW: PW,
            confirmPW: confirmPW
        }

        apis
            .createAccountAX(user)
            .then((res) => {
                console.log("React send User info :::", user)
                if (res.data.msg === "success") {
                    dispatch(creatAccount_(user))
                    dispatch(signupShow(false));
                    dispatch(loginShow(true));
                } else if (res.status >= 400) {
                    showError(res.status, res.data.msg);
                    history.push('/error');

                }

            })
            .catch((error) => {
                console.log(error)
            });
    }
}

//회원가입시 아이디 중복확인
const checkOverlapMW = (userID) => {
    return function (dispatch, getState, {history}) {
        apis
            .checkOverlapAX(userID)
            .then((res) => {
                if (res.status >= 400) {
                    showError(res.status, res.data.msg);
                    history.push('/error');
                    return;
                }
                dispatch(changeWarnID(res.data.msg))
                console.log("중복확인 성공")
            })
            .catch((error) => {
                console.log(error)
            });
    }
}

//로그인
const loginMW = (userID, PW) => {
    return function (dispatch, getState, {history}) {
        const user = {
            userID: userID,
            PW: PW
        }
        const cookies = new Cookies();
        apis
            .loginPostAX(user)
            .then((res) => {
                if (res.data.msg === "success") {
                    cookies.set('token', res.data.token);
                    window
                        .location
                        .reload();
                } else if (res.status >= 400) {
                    showError(res.status, res.data.msg);
                    history.push('/error');

                } else {
                    alert(res.data.msg);
                }
                console.log("response:::", res);
            })
    }
}

export default handleActions({
    [CREATE_ACCOUNT]: (state, action) => produce(state, (draft) => {
        const newAccount = {
            userID: action.payload.userID,
            PW: action.payload.PW,
            confirmPW: action.payload.confirmPW
        }
        draft.createAccount = {
            ...draft.createAccount,
            newAccount
        }
    }),
    [WARN_ID]: (state, action) => produce(state, (draft) => {
        draft.warnID = action.payload.warnID
    })
}, initialState);

export const actionCreators = {
    creatAccount_,
    changeWarnID,
    createAccountMW,
    checkOverlapMW,
    loginMW
}