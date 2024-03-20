import {
  Divider,
  IconButton,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
  type IconButtonProps,
} from "@mui/material";
import { useAtom, useAtomValue } from "jotai";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { forwardRef, useCallback, useId, useRef, type MouseEvent } from "react";

import { LOGO, SITE_URL } from "../../../shared/constants";
import { platformAtom } from "../../shared-states";
import { PlateauLogotype, PlateauSymbol, SelectItem, Shortcut } from "../../ui-components";
import {
  hideAppOverlayAtom,
  showFeedbackModalAtom,
  showHelpModalAtom,
  showMyDataModalAtom,
} from "../states/app";

export interface MainMenuButtonProps extends Omit<IconButtonProps, "onClick"> {
  onClick?: (event: MouseEvent<HTMLElement>, name: string) => void;
}

export const MainMenuButton = forwardRef<HTMLButtonElement, MainMenuButtonProps>(
  ({ onClick, ...props }, ref) => {
    const id = useId();
    const popupState = usePopupState({
      variant: "popover",
      popupId: id,
    });

    const [hideAppOverlay, setHideAppOverlay] = useAtom(hideAppOverlayAtom);
    const [, setShowFeedbackModal] = useAtom(showFeedbackModalAtom);
    const [, setShowMyDataModal] = useAtom(showMyDataModalAtom);
    const [, setShowHelpModal] = useAtom(showHelpModalAtom);

    const onClickRef = useRef(onClick);
    onClickRef.current = onClick;
    const handleClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        const name = event.currentTarget.dataset.name;
        if (name == null) {
          popupState.close();
          return;
        }
        switch (name) {
          case "hide-ui":
            setHideAppOverlay(value => !value);
            break;
          case "feedback":
            setShowFeedbackModal(value => !value);
            break;
          case "my-data":
            setShowMyDataModal(value => !value);
            break;
          case "help":
            setShowHelpModal(value => !value);
            break;
        }
        onClickRef.current?.(event, name);
        popupState.close();
      },
      [popupState, setHideAppOverlay, setShowFeedbackModal, setShowMyDataModal, setShowHelpModal],
    );

    const platform = useAtomValue(platformAtom);

    return (
      <>
        <IconButton ref={ref} aria-label="メインメニュー" {...bindTrigger(popupState)} {...props}>
          {LOGO ? (
            <img src={LOGO} alt="customIcon" height={24} />
          ) : (
            <PlateauSymbol sx={{ fontSize: 24 }} />
          )}
        </IconButton>
        <Menu
          {...bindMenu(popupState)}
          anchorOrigin={{
            horizontal: "center",
            vertical: "bottom",
          }}
          transformOrigin={{
            horizontal: "center",
            vertical: "top",
          }}>
          <MenuItem
            component="a"
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}>
            {LOGO ? (
              <img src={LOGO} alt="customIcon" height={32} />
            ) : (
              <PlateauLogotype sx={{ height: 32, marginX: 2, marginY: 1 }} />
            )}
          </MenuItem>
          <Divider />
          <SelectItem
            component="a"
            href="https://www.geospatial.jp/ckan/dataset/plateau"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}>
            3D都市モデルダウンロード
          </SelectItem>
          <SelectItem data-name="my-data" onClick={handleClick}>
            Myデータ
          </SelectItem>
          <SelectItem data-name="help" onClick={handleClick}>
            ヘルプ
          </SelectItem>
          <SelectItem data-name="feedback" onClick={handleClick}>
            フィードバック
          </SelectItem>
          <Divider />
          <SelectItem data-name="hide-ui" onClick={handleClick}>
            UIを{hideAppOverlay ? "表示" : "隠す"}
            <ListItemSecondaryAction>
              <Shortcut platform={platform} shortcutKey="/" commandKey />
            </ListItemSecondaryAction>
          </SelectItem>
        </Menu>
      </>
    );
  },
);
