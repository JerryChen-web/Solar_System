# Interaction Guide

## Overview Mode

Overview mode is the main solar-system view. It shows the Sun, planets, Moon, orbit paths, labels, asteroid belt, Kuiper belt, and the existing validation/report UI.

Clicking any body still selects it and updates the body detail panel. Clicking Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, or Neptune also enters that planet's local focus mode.

## Body Focus Mode

Body focus mode keeps the same simulation and validation state but moves the camera into a close local view of the selected planet. The focused body remains tracked as the simulation advances.

Supported focus bodies:

- Mercury
- Venus
- Earth
- Mars
- Jupiter
- Saturn
- Uranus
- Neptune

Press `ESC` or use `Back to solar system` to return to the overview camera. `ESC` is ignored while typing in text inputs, selects, textareas, or editable elements.

## Selection And Follow

Entering focus mode selects the clicked body. Focus mode temporarily overrides follow-camera updates so the close-up composition stays stable. Existing Follow / Stop Follow state remains visible and predictable; returning to overview restores the overview camera and allows the remembered follow target to continue if it is still active.
