#ifndef _YI_BITMOVIN_VIDEO_SURFACE_H_
#define _YI_BITMOVIN_VIDEO_SURFACE_H_

#include <player/YiVideoSurfacePlatform.h>

class CYIBitmovinVideoPlayerPriv;

class CYIBitmovinVideoSurface : public CYIVideoSurfacePlatform
{
public:
    CYIBitmovinVideoSurface(CYIBitmovinVideoPlayerPriv *pPlayerPriv);
    virtual ~CYIBitmovinVideoSurface();

protected:
    virtual void SetVideoRectangle(const YI_RECT_REL &videoRectangle) override;
    virtual void OnAttached(CYIVideoSurfaceView *pVideoSurfaceView) override;
    virtual void OnDetached(CYIVideoSurfaceView *pVideoSurfaceView) override;

private:
    CYIBitmovinVideoPlayerPriv *m_pPlayerPriv;
};

#endif // _YI_BITMOVIN_VIDEO_SURFACE_H_
