import { TransferState } from '../../types';

import { TON_TOKEN_SLUG } from '../../../config';
import { callActionInNative } from '../../../util/multitab';
import { IS_DELEGATING_BOTTOM_SHEET } from '../../../util/windowEnvironment';
import { addActionHandler, setGlobal } from '../../index';
import {
  clearCurrentDappTransfer,
  clearCurrentSignature,
  clearCurrentTransfer,
  updateAccountState,
  updateCurrentSignature,
  updateCurrentTransfer,
} from '../../reducers';
import {
  selectAccountState,
} from '../../selectors';

addActionHandler('apiUpdate', (global, actions, update) => {
  switch (update.type) {
    case 'createTransaction': {
      const {
        promiseId,
        amount,
        toAddress,
        fee,
        comment,
        rawPayload,
        parsedPayload,
        stateInit,
      } = update;

      global = clearCurrentTransfer(global);
      global = updateCurrentTransfer(global, {
        state: TransferState.Confirm,
        toAddress,
        amount,
        fee,
        comment,
        promiseId,
        tokenSlug: TON_TOKEN_SLUG,
        rawPayload,
        parsedPayload,
        stateInit,
      });
      setGlobal(global);

      break;
    }

    case 'createSignature': {
      const { promiseId, dataHex } = update;

      global = clearCurrentSignature(global);
      global = updateCurrentSignature(global, {
        promiseId,
        dataHex,
      });
      setGlobal(global);

      break;
    }

    case 'showError': {
      const { error } = update;
      actions.showError({ error });

      break;
    }

    case 'dappConnect': {
      if (IS_DELEGATING_BOTTOM_SHEET) {
        callActionInNative('apiUpdateDappConnect', update);
      }

      actions.apiUpdateDappConnect(update);

      break;
    }

    case 'updateActiveDapp': {
      const { accountId, origin } = update;

      global = updateAccountState(global, accountId, {
        activeDappOrigin: origin,
      });
      setGlobal(global);
      break;
    }

    case 'dappDisconnect': {
      const { accountId, origin } = update;
      const accountState = selectAccountState(global, accountId);

      if (accountState?.activeDappOrigin === origin) {
        global = updateAccountState(global, accountId, {
          activeDappOrigin: undefined,
        });
        global = clearCurrentDappTransfer(global);
        setGlobal(global);
      }
      break;
    }

    case 'dappLoading': {
      if (IS_DELEGATING_BOTTOM_SHEET) {
        callActionInNative('apiUpdateDappLoading', update);
      }

      actions.apiUpdateDappLoading(update);

      break;
    }

    case 'dappCloseLoading': {
      if (IS_DELEGATING_BOTTOM_SHEET) {
        callActionInNative('apiUpdateDappCloseLoading');
      }

      actions.apiUpdateDappCloseLoading();

      break;
    }

    case 'dappSendTransactions': {
      if (IS_DELEGATING_BOTTOM_SHEET) {
        callActionInNative('apiUpdateDappSendTransaction', update);
      }

      actions.apiUpdateDappSendTransaction(update);

      break;
    }

    case 'prepareTransaction': {
      const {
        amount,
        toAddress,
        comment,
        binPayload,
      } = update;

      global = clearCurrentTransfer(global);
      global = updateCurrentTransfer(global, {
        state: TransferState.Initial,
        toAddress,
        amount: amount ?? 0n,
        comment,
        tokenSlug: TON_TOKEN_SLUG,
        binPayload,
      });

      setGlobal(global);
    }
  }
});
