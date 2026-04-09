import { NumberInput } from "./NumberInput";
import { t } from "../core/i18n";
import type { CalibrationProfile, Locale } from "../core/types";

const NEW_PROFILE_OPTION_VALUE = "__new_profile__";

interface CalibrationPanelProps {
  locale: Locale;
  selectedProfile: CalibrationProfile;
  profiles: CalibrationProfile[];
  isCustomCalibrationProfile: boolean;
  showBorders: boolean;
  isExporting: boolean;
  isProfileActionsOpen: boolean;
  profileTransferNotice: {
    tone: "success" | "error";
    message: string;
  } | null;
  profileImportRef: { current: HTMLInputElement | null };
  profileActionsRef: { current: HTMLDivElement | null };
  onOpenHelp: () => void;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: () => void;
  onUpdateProfile: (patch: Partial<CalibrationProfile>) => void;
  onToggleShowBorders: () => void;
  onToggleProfileActions: () => void;
  onDuplicateProfile: () => void;
  onDeleteProfile: () => void;
  onExportProfiles: () => void;
  onImportProfiles: (event: Event) => void;
  onOverlayPdfDownload: () => void;
  onOpenOverlayInfo: () => void;
}

export function CalibrationPanel({
  locale,
  selectedProfile,
  profiles,
  isCustomCalibrationProfile,
  showBorders,
  isExporting,
  isProfileActionsOpen,
  profileTransferNotice,
  profileImportRef,
  profileActionsRef,
  onOpenHelp,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onToggleShowBorders,
  onToggleProfileActions,
  onDuplicateProfile,
  onDeleteProfile,
  onExportProfiles,
  onImportProfiles,
  onOverlayPdfDownload,
  onOpenOverlayInfo,
}: CalibrationPanelProps) {
  return (
    <div class="section-card">
      <div class="section-card__header">
        <div class="section-card__header-title">
          <h3>{t(locale, "sectionCalibration")}</h3>
          <button
            aria-label={t(locale, "calibrationHelpOpen")}
            class="info-button"
            onClick={onOpenHelp}
            type="button"
          >
            ?
          </button>
        </div>
      </div>
      <div class="form-grid">
        <label class={`field${isCustomCalibrationProfile ? "" : " field--full"}`}>
          <span>{t(locale, "fieldCalibrationProfile")}</span>
          <select
            onInput={(event) => {
              const nextValue = (event.currentTarget as HTMLSelectElement).value;
              if (nextValue === NEW_PROFILE_OPTION_VALUE) {
                onCreateProfile();
                return;
              }

              onSelectProfile(nextValue);
            }}
            value={selectedProfile.id}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
            <option value={NEW_PROFILE_OPTION_VALUE}>
              {t(locale, "optionNewProfile")}
            </option>
          </select>
        </label>
        {isCustomCalibrationProfile ? (
          <label class="field">
            <span>{t(locale, "fieldProfileName")}</span>
            <input
              onInput={(event) =>
                onUpdateProfile({
                  name: (event.currentTarget as HTMLInputElement).value,
                })
              }
              type="text"
              value={selectedProfile.name}
            />
          </label>
        ) : null}
      </div>
      <div class="calibration-controls-grid">
        <label class="field field--compact">
          <span>{t(locale, "fieldOffsetX")}</span>
          <NumberInput
            onInput={(event) =>
              onUpdateProfile({
                offsetXMm:
                  Number((event.currentTarget as HTMLInputElement).value) || 0,
              })
            }
            step="0.01"
            value={selectedProfile.offsetXMm}
          />
        </label>
        <label class="field field--compact">
          <span>{t(locale, "fieldOffsetY")}</span>
          <NumberInput
            onInput={(event) =>
              onUpdateProfile({
                offsetYMm:
                  Number((event.currentTarget as HTMLInputElement).value) || 0,
              })
            }
            step="0.01"
            value={selectedProfile.offsetYMm}
          />
        </label>
        <label class="field field--compact">
          <span>{t(locale, "fieldPitchX")}</span>
          <NumberInput
            onInput={(event) =>
              onUpdateProfile({
                pitchAdjustXMm:
                  Number((event.currentTarget as HTMLInputElement).value) || 0,
              })
            }
            step="0.01"
            value={selectedProfile.pitchAdjustXMm}
          />
        </label>
        <label class="field field--compact">
          <span>{t(locale, "fieldPitchY")}</span>
          <NumberInput
            onInput={(event) =>
              onUpdateProfile({
                pitchAdjustYMm:
                  Number((event.currentTarget as HTMLInputElement).value) || 0,
              })
            }
            step="0.01"
            value={selectedProfile.pitchAdjustYMm}
          />
        </label>
        <label class="field field--compact">
          <span>{t(locale, "fieldShowBorders")}</span>
          <button
            aria-pressed={showBorders}
            class={`toggle-row${showBorders ? " toggle-row--active" : ""}`}
            onClick={onToggleShowBorders}
            type="button"
          >
            <span class="toggle-row__status">
              {t(locale, showBorders ? "toggleEnabled" : "toggleDisabled")}
            </span>
            <span class="toggle-switch" aria-hidden="true">
              <span class="toggle-switch__thumb" />
            </span>
          </button>
        </label>
      </div>
      <div class="calibration-actions-row">
        <div class="profile-actions" ref={profileActionsRef}>
          <button
            aria-expanded={isProfileActionsOpen}
            aria-haspopup="menu"
            class="button button--ghost profile-actions__trigger"
            onClick={onToggleProfileActions}
            type="button"
          >
            <span>{t(locale, "buttonProfileActions")}</span>
            <span aria-hidden="true" class="color-menu__chevron">
              ▾
            </span>
          </button>
          {isProfileActionsOpen ? (
            <div class="profile-actions__menu" role="menu">
              <button
                class="profile-actions__item"
                onClick={onDuplicateProfile}
                role="menuitem"
                type="button"
              >
                {t(locale, "buttonDuplicateProfile")}
              </button>
              <button
                class="profile-actions__item"
                disabled={profiles.length <= 1 || selectedProfile.id === "default"}
                onClick={onDeleteProfile}
                role="menuitem"
                type="button"
              >
                {t(locale, "buttonDeleteProfile")}
              </button>
              <button
                class="profile-actions__item"
                onClick={onExportProfiles}
                role="menuitem"
                type="button"
              >
                {t(locale, "buttonExportProfiles")}
              </button>
              <button
                class="profile-actions__item"
                onClick={() => {
                  onToggleProfileActions();
                  profileImportRef.current?.click();
                }}
                role="menuitem"
                type="button"
              >
                {t(locale, "buttonImportProfiles")}
              </button>
            </div>
          ) : null}
          <input
            accept="application/json,.json"
            class="visually-hidden"
            onInput={onImportProfiles}
            ref={profileImportRef}
            type="file"
          />
        </div>
        <div class="overlay-actions">
          <button
            class="button button--ghost"
            disabled={isExporting}
            onClick={onOverlayPdfDownload}
            type="button"
          >
            {t(locale, "buttonOverlayPdf")}
          </button>
          <button
            aria-label={t(locale, "overlayHelpOpen")}
            class="info-button"
            onClick={onOpenOverlayInfo}
            type="button"
          >
            ?
          </button>
        </div>
      </div>
      {profileTransferNotice ? (
        <p
          class={`field-hint field-hint--${profileTransferNotice.tone}`}
          role="status"
        >
          {profileTransferNotice.message}
        </p>
      ) : null}
    </div>
  );
}
