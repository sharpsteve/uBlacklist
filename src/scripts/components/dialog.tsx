import * as Goober from 'goober';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import { DIALOG_Z_INDEX, FOCUS_END_CLASS, FOCUS_START_CLASS } from './constants';
import { applyClassName, useInnerRef } from './helpers';
import { useClassName } from './utilities';

function handleKeyDown(
  e: React.KeyboardEvent<HTMLDivElement>,
  dialog: HTMLDivElement,
  close: () => void,
): void {
  e.stopPropagation();
  if (e.nativeEvent.isComposing) {
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
  } else if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (
        e.target === dialog ||
        (e.target instanceof HTMLElement && e.target.matches(`.${FOCUS_START_CLASS}`))
      ) {
        e.preventDefault();
        dialog.querySelector<HTMLElement>(`.${FOCUS_END_CLASS}`)?.focus();
      }
    } else {
      if (e.target instanceof HTMLElement && e.target.matches(`.${FOCUS_END_CLASS}`)) {
        e.preventDefault();
        dialog.querySelector<HTMLElement>(`.${FOCUS_START_CLASS}`)?.focus();
      }
    }
  }
}

export type DialogProps = JSX.IntrinsicElements['div'] & {
  close: () => void;
  open: boolean;
  width?: string;
};

export const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { close, open, width = '480px', ...props },
  ref,
) {
  const prevFocus = useRef<Element | null>(null);
  const innerRef = useInnerRef(ref);
  const rootClassName = useMemo(
    () =>
      Goober.css.bind({ target: document.head })({
        overflow: 'hidden !important',
      }),
    [],
  );

  useLayoutEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      innerRef.current?.querySelector<HTMLElement>(`.${FOCUS_START_CLASS}`)?.focus();
      document.documentElement.classList.add(rootClassName);
    } else {
      if (prevFocus.current instanceof HTMLElement || prevFocus.current instanceof SVGElement) {
        prevFocus.current.focus();
      }
      document.documentElement.classList.remove(rootClassName);
    }
    // 'innerRef' and 'rootClass' do not change between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const wrapperClassName = useClassName(
    () => ({
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.6)',
      display: open ? 'flex' : 'none',
      justifyContent: 'center',
      height: '100%',
      left: 0,
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: DIALOG_Z_INDEX,
    }),
    [open],
  );
  const dialogClassName = useClassName(
    theme => ({
      background: theme.dialog.background,
      borderRadius: '8px',
      boxShadow: '0 0 16px rgba(0, 0, 0, 0.12), 0 16px 16px rgba(0, 0, 0, 0.24)',
      maxHeight: '100%',
      maxWidth: '100%',
      overflowY: 'auto',
      padding: '1.5em',
      position: 'relative',
      width,
    }),
    [width],
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={wrapperClassName}
      tabIndex={-1}
      onClick={e => {
        if (e.target === e.currentTarget) {
          close();
        }
      }}
      onKeyDown={e => {
        if (innerRef.current) {
          handleKeyDown(e, innerRef.current, close);
        }
      }}
      onKeyPress={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
    >
      <div
        {...applyClassName(props, dialogClassName)}
        aria-modal={open}
        ref={innerRef}
        role="dialog"
      />
    </div>
  );
});

export type DialogHeaderProps = JSX.IntrinsicElements['div'];

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader(props, ref) {
    const className = useClassName({
      marginBottom: '1em',
    });
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

export type DialogTitleProps = JSX.IntrinsicElements['h1'];

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ children, ...props }, ref) {
    const className = useClassName({
      fontSize: '1.125em',
      fontWeight: 'normal',
      margin: 0,
    });
    return (
      <h1 {...applyClassName(props, className)} ref={ref}>
        {children}
      </h1>
    );
  },
);

export type DialogBodyProps = JSX.IntrinsicElements['div'];

export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(function DialogBody(
  props,
  ref,
) {
  return <div {...props} ref={ref} />;
});

export type DialogFooterProps = JSX.IntrinsicElements['div'];

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter(props, ref) {
    const className = useClassName({
      marginTop: '2em',
    });
    return <div {...applyClassName(props, className)} ref={ref} />;
  },
);

export type EmbeddedDialogProps = JSX.IntrinsicElements['div'] & {
  close: () => void;
  width: string;
};

export const EmbeddedDialog = React.forwardRef<HTMLDivElement, EmbeddedDialogProps>(
  function EmbeddedDialog({ close, width, ...props }, ref) {
    const innerRef = useInnerRef(ref);

    const className = useClassName(
      theme => ({
        background: theme.dialog.background,
        outline: 'none',
        padding: '1.5em',
        // #if !SAFARI
        maxWidth: '100%',
        width,
        /* #else
          [`@media (min-device-width: ${width})`]: {
            minWidth: width,
          },
          */
        // #endif
      }),
      [width],
    );

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        {...applyClassName(props, className)}
        ref={innerRef}
        tabIndex={-1}
        onKeyDown={e => {
          if (innerRef.current) {
            handleKeyDown(e, innerRef.current, close);
          }
        }}
      />
    );
  },
);
